{
  description = "A very basic flake";

  outputs =
    {
      self,
      nixpkgs,
      nixpkgs-23-05,
    }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      eachSystems =
        f:
        nixpkgs.lib.genAttrs systems (
          system:
          f (rec {
            inherit system;
            pkgs = nixpkgs.legacyPackages.${system};
          })
        );
    in
    {
      devShells = eachSystems (
        { system, pkgs, ... }:
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              nodejs
              nodePackages.pnpm
              pkg-config
              zlib
              openssl
              prisma-engines
            ];
            shellHook =
              let
                prisma-engines = nixpkgs-23-05.legacyPackages.${system}.prisma-engines;
              in
              ''
                export PRISMA_MIGRATION_ENGINE_BINARY="${prisma-engines}/bin/migration-engine"
                export PRISMA_QUERY_ENGINE_BINARY="${prisma-engines}/bin/query-engine"
                export PRISMA_QUERY_ENGINE_LIBRARY="${prisma-engines}/lib/libquery_engine.node"
                export PRISMA_INTROSPECTION_ENGINE_BINARY="${prisma-engines}/bin/introspection-engine"
                export PRISMA_FMT_BINARY="${prisma-engines}/bin/prisma-fmt"
              '';
          };
        }
      );
    };

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

    nixpkgs-23-05.url = "github:NixOS/nixpkgs/nixos-23.05";
  };
}
