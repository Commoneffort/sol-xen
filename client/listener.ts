import dotenv from "dotenv";
import {SolXen} from '../target/types/sol_xen';
import {AnchorProvider, setProvider, Program, web3, workspace} from '@coral-xyz/anchor';
import {debug} from "debug";

dotenv.config();
debug.enable(process.env.DEBUG || '*')

const Y = '\x1b[33m';

async function main() {
    const log = debug("sol-xen")

    // Set this to your local cluster or mainnet-beta, testnet, devnet
    const network = process.env.ANCHOR_PROVIDER_URL || 'devnet';
    log("Listening to solXEN events on", network)
    const connection = new web3.Connection(network, 'processed');
    const provider = new AnchorProvider(
        connection,
        null as any,
    )
    setProvider(provider);
    const program = workspace.SolXen as Program<SolXen>;

    let listener: number;

    const onHashEvent = (event: any, slot: number) => {
        const { user, ethAccount, hashes, superhashes, points } = event;
        const account = Buffer.from(ethAccount).toString("hex");
        log(`Event: ${Y}slot=${slot.toString()}, user=${user.toBase58()}, account=${account}, hashes=${hashes}, superhashes=${superhashes}, points=${points}`);
    }

    process.addListener("SIGINT", () => {
        if (listener) {
            program.removeEventListener(listener);
            log('done')
        }
        process.exit(0)
    })

    listener = program.addEventListener("hashEvent", onHashEvent);

    // prevent the script from exiting
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

main().then(() => {})
    .catch(err => console.error(err));
