const { Client } = require('ssh2');

// Mutation keywords that must NEVER appear in an audit command (read-only rule).
const MUTATION = /\b(add|set|remove|enable|disable|reset-configuration|reset|backup|load|import|move|renumber|flush|comment|edit|undo|redo|fetch|reboot|shutdown|power-off|certificate\s+add|tool\s+)\b/i;

// Allowed read actions. Commands must start with '/' and match one of these.
function isReadOnly(cmd) {
  const c = (cmd || '').trim();
  if (!c.startsWith('/')) return false;
  if (MUTATION.test(c)) return false;
  const ok =
    /\/export(\s|$)/.test(c) ||
    /\bprint\b/.test(c) ||
    /\/system\s+(resource|identity|clock|routerboard|license)\b/.test(c) ||
    /\/log\s+print/.test(c) ||
    /\/ping\s/.test(c) ||
    /\/interface\s+[a-z0-9\-]+\s+monitor\b/.test(c) ||
    /\/caps-man\s+[a-z0-9\-]+\s+print/.test(c) ||
    /\/routing\s+[a-z0-9\-]+\s+print/.test(c) ||
    /\/interface\s+(vrrp|wireguard|bridge|wireless|pppoe-client|pptp-server|sstp-server|ovpn-server|l2tp-server)\b[^\n]*(print|monitor)/.test(c);
  return ok;
}

// Run a list of read-only commands sequentially, streaming each command + output.
// onEvent({event:'command'|'output'|'error', command?, text?, message?})
// Returns the full concatenated audit text.
function runAudit({ host, port, user, auth, commands, onEvent }) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    const blocks = [];

    conn.on('error', (e) => reject(new Error('Koneksi SSH gagal: ' + e.message)));
    conn.on('ready', () => {
      let i = 0;
      const next = () => {
        if (i >= commands.length) { conn.end(); return resolve(blocks.join('\n')); }
        const cmd = commands[i++];
        onEvent({ event: 'command', command: cmd });
        conn.exec(cmd, (err, stream) => {
          if (err) {
            onEvent({ event: 'error', message: cmd + ': ' + err.message });
            blocks.push('### ' + cmd + '\n[error] ' + err.message);
            next();
            return;
          }
          let buf = '';
          stream.on('data', (d) => { buf += d.toString(); });
          stream.stderr.on('data', (d) => { buf += d.toString(); });
          stream.on('close', () => {
            onEvent({ event: 'output', text: buf });
            blocks.push('### ' + cmd + '\n' + buf);
            next();
          });
        });
      };
      next();
    });

    const opts = {
      host,
      port: port ? Number(port) : 22,
      username: user,
      readyTimeout: 20000,
      keepaliveInterval: 5000
    };
    if (auth && auth.type === 'key') opts.privateKey = auth.key;
    else if (auth) opts.password = auth.password;

    conn.connect(opts);
  });
}

module.exports = { isReadOnly, runAudit };
