import tunnelSSH, { createTunnel } from 'tunnel-ssh';

const openRemoteTunnelSSH = async (host: string, hostSslPort: number, username: string, password: string, srcPort: number, dstPort: number) => {
    const sshOptions = {
        host,
        agent:process.env.SSH_AUTH_SOCK,
        port: hostSslPort,
        username,
        password
    };

    const openTunnel = async (sshOptions: any, srcPort: number, dstPort: number, autoClose = true) => {
        let forwardOptions = {
            srcAddr: '127.0.0.1',
            srcPort,
            dstAddr: '127.0.0.1',
            dstPort
        }

        let tunnelOptions = {
            autoClose
        }

        let serverOptions = {
            port: srcPort
        }

        let server: any
        let conn: any
        try {
            [server, conn] = await createTunnel(tunnelOptions, serverOptions, sshOptions, forwardOptions).catch(reason => {
                console.log(reason)
                return reason
            });
        } catch (e) {
            console.log(e)
        }
        return [server, conn]
    }
    while (true) {
        let server: any
        let conn: any
        try {
            [server, conn] = await openTunnel(sshOptions, srcPort, dstPort, false).catch(reason => {
                console.log(reason)
                return reason
            });

            server.on('connection', (connection: any) => {
                console.log(`New connection`);
            });
            while (true) {
                await new Promise(res => setTimeout(res, 1000))
            }
        } catch (e) {
            console.log(e)
            await new Promise(res => setTimeout(res, 10000))
        }
    }
}

const localPort = 9443
const remotePort = 10000
const remoteHost = '192.168.2.80'
const remoteHostSslPort = 22
const username = 'rapidreach'
const password = 'Ett&2tre'

try {
    openRemoteTunnelSSH(remoteHost, remoteHostSslPort, username, password, localPort, remotePort).catch(error => {
        console.log(error.message)
    })
} catch (e) {
    console.log(e)
}

process.on('uncaughtException', error => {
    console.log(error.message)
    openRemoteTunnelSSH(remoteHost, remoteHostSslPort, username, password, localPort, remotePort).catch(error => {
        console.log(error.message)
    })
})