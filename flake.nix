{
  description = "A very basic flake";

  outputs =
    inputs:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      eachSystems =
        f:
        inputs.nixpkgs.lib.genAttrs systems (
          system:
          f (rec {
            inherit system;
            pkgs = import inputs.nixpkgs {
              inherit system;

              overlays = [
                (final: prev: { prisma-engines = inputs.nixpkgs-23-05.legacyPackages.${system}.prisma-engines; })
              ];
            };
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
            shellHook = ''
              export PRISMA_MIGRATION_ENGINE_BINARY="${pkgs.prisma-engines}/bin/migration-engine"
              export PRISMA_QUERY_ENGINE_BINARY="${pkgs.prisma-engines}/bin/query-engine"
              export PRISMA_QUERY_ENGINE_LIBRARY="${pkgs.prisma-engines}/lib/libquery_engine.node"
              export PRISMA_INTROSPECTION_ENGINE_BINARY="${pkgs.prisma-engines}/bin/introspection-engine"
              export PRISMA_FMT_BINARY="${pkgs.prisma-engines}/bin/prisma-fmt"
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
