import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

// Additional tests for Bradley Coin

describe("Bradley Coin Advanced Tests", () => {
  it("should not allow non-owner to mint tokens", () => {
    const block = simnet.callPublicFn(
      "fungible-token",
      "mint",
      [Cl.uint(100), Cl.standardPrincipal(wallet2)],
      wallet1 // Not deployer
    );
    expect(block.result).toBeErr();
  });

  it("should fail transfer if balance is insufficient", () => {
    const block = simnet.callPublicFn(
      "fungible-token",
      "transfer",
      [Cl.uint(999999), Cl.standardPrincipal(wallet1), Cl.standardPrincipal(wallet2), Cl.none()],
      wallet1
    );
    expect(block.result).toBeErr();
  });

  it("should return correct decimals", () => {
    const decimals = simnet.callReadOnlyFn(
      "fungible-token",
      "get-decimals",
      [],
      deployer
    );
    expect(decimals.result).toBeOk(Cl.uint(6));
  });

  it("should return correct token name and symbol", () => {
    const name = simnet.callReadOnlyFn("fungible-token", "get-name", [], deployer);
    const symbol = simnet.callReadOnlyFn("fungible-token", "get-symbol", [], deployer);
    expect(name.result).toBeOk(Cl.string("bradley coin cmbl"));
    expect(symbol.result).toBeOk(Cl.string("sBC"));
  });

  it("should return correct token URI", () => {
    const uri = simnet.callReadOnlyFn("fungible-token", "get-token-uri", [], deployer);
    expect(uri.result).toBeOk(Cl.some(Cl.string("https://hiro.so")));
  });
});
