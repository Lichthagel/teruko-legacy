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
          f rec {
            inherit system;
            pkgs = import inputs.nixpkgs {
              inherit system;

              overlays = [
                (final: prev: { prisma-engines = inputs.nixpkgs-23-05.legacyPackages.${system}.prisma-engines; })
              ];
            };
          }
        );
    in
    {
      packages = eachSystems (
        { pkgs, ... }:
        rec {
          default = teruko;

          teruko = pkgs.stdenvNoCC.mkDerivation (finalAttrs: {
            pname = "teruko";
            version = "git";

            src = ./.;

            nativeBuildInputs = with pkgs; [
              nodejs
              makeWrapper
              openssl
              pnpm.configHook
            ];

            pnpmDeps = pkgs.pnpm.fetchDeps {
              inherit (finalAttrs) pname version src;
              hash = "sha256-m0WqGjD4puZqMImp1fhWLwvalPAaPG9dv9AwcKtK3Cg=";
            };

            PRISMA_MIGRATION_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/migration-engine";
            PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
            PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
            PRISMA_INTROSPECTION_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/introspection-engine";
            PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";

            buildPhase = ''
              runHook preBuild

              cd teruko-client
              pnpm run build

              cd ../teruko-server
              pnpm run build

              cd ..

              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall

              mkdir -p $out/lib
              cp -r . $out/lib/teruko

              mkdir -p $out/bin
              makeWrapper ${pkgs.nodejs}/bin/node $out/bin/teruko \
                --add-flags "$out/lib/teruko/teruko-server/build/index.js" \
                --prefix FRONTEND_FOLDER : "$out/lib/teruko/teruko-client/dist" \
                --prefix PRISMA_MIGRATION_ENGINE_BINARY : "$PRISMA_MIGRATION_ENGINE_BINARY" \
                --prefix PRISMA_QUERY_ENGINE_BINARY : "$PRISMA_QUERY_ENGINE_BINARY" \
                --prefix PRISMA_QUERY_ENGINE_LIBRARY : "$PRISMA_QUERY_ENGINE_LIBRARY" \
                --prefix PRISMA_INTROSPECTION_ENGINE_BINARY : "$PRISMA_INTROSPECTION_ENGINE_BINARY" \
                --prefix PRISMA_FMT_BINARY : "$PRISMA_FMT_BINARY"

              runHook postInstall
            '';
          });
        }
      );

      devShells = eachSystems (
        { pkgs, ... }:
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              nodejs
              corepack
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
