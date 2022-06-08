import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { assert } from "chai";
import { SetCounterAnchor } from "../target/types/set_counter_anchor";

describe("set_counter_anchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SetCounterAnchor as Program<SetCounterAnchor>;

  const stateAccount = anchor.web3.Keypair.generate();

  const setValue = 123; // can be any u32 number

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize({
      accounts: {
        state: stateAccount.publicKey,
        user: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId
      },
      signers: [stateAccount],
    });

    const state = await program.account.state.fetch(stateAccount.publicKey);
    assert.equal(state.counter, 0);
  });

  it("set value", async () => {
    await program.rpc.set(new anchor.BN(setValue), {
      accounts: {
        state: stateAccount.publicKey
      }
    });

    const state = await program.account.state.fetch(stateAccount.publicKey);
    assert.equal(state.counter, setValue);
  });

  it("increment", async () => {
    await program.rpc.increment({
      accounts: {
        state: stateAccount.publicKey
      }
    });

    const state = await program.account.state.fetch(stateAccount.publicKey);
    assert.equal(state.counter, setValue + 1);
  });

  it("decrement", async () => {
    await program.rpc.decrement({
      accounts: {
        state: stateAccount.publicKey
      }
    });

    const state = await program.account.state.fetch(stateAccount.publicKey);
    assert.equal(state.counter, setValue);
  });
});
