<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/64c48edd-f725-4d31-9912-ae15bc1152c3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Target data

The dashboard starts with no sample targets or security events. To add a Linux or Windows machine, open **Add a Linux or Windows machine** and enter the SOC manager address as reachable from the target system. Do not use `localhost` or `127.0.0.1` unless the manager itself is running on that system: loopback addresses point back to the target. This is why a command using `http://localhost:3000` fails when run on a target while the app runs on the host.

For a manager running on a Windows host, use the host's reachable IPv4 address (find it with `ipconfig`) and port `3000`, for example `http://192.168.1.20:3000`. Ensure the VM network can reach that host address and the host firewall allows the manager port on the private VM network; do not expose the development server to the public internet.

Run the generated Linux command with sudo, or run the generated Windows command in an elevated PowerShell window inside the VM. The Linux installer creates and enables a systemd service; the Windows installer creates a startup scheduled task. Both automatically register/re-register the VM and send its current hostname, guest IP, OS version, and heartbeat every 15 seconds, including after reboots. Event and resource data remain empty until the VM reports those values. Target and event data are held in memory and are cleared when the server restarts.
