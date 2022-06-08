import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { SetCounterAnchor } from "../target/types/set_counter_anchor";

describe("set_counter_anchor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SetCounterAnchor as Program<SetCounterAnchor>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
