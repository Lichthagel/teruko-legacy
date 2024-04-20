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
      packages = eachSystems (
        { pkgs, ... }:
        let
          pnpmDeps = pkgs.stdenvNoCC.mkDerivation {
            name = "teruko-pnpm-deps";

            src = ./.;

            nativeBuildInputs = with pkgs; [
              nodePackages.pnpm
              jq
              moreutils
              cacert
            ];

            configurePhase = ''
              runHook preConfigure

              export HOME=$(mktemp -d)
              pnpm config set store-dir $out

              runHook postConfigure
            '';

            installPhase = ''
              runHook preInstall

              # use --ignore-script and --no-optional to avoid downloading binaries
              # use --frozen-lockfile to avoid checking git deps
              pnpm install -r

              runHook postInstall
            '';

            fixupPhase = ''
              runHook preFixup

              rm -rf $out/v3/tmp
              for f in $(find $out -name "*.json"); do
                sed -i -E -e 's/"checkedAt":[0-9]+,//g' $f
                jq --sort-keys . $f | sponge $f
              done

              runHook postFixup
            '';

            # dontConfigure = true;
            dontBuild = true;

            outputHashMode = "recursive";
            outputHash = "sha256-+/x8G3jNt0V9seBotmP/+28CLt6q2KNyIaFc5UebzxY=";
            outputHashAlgo = "sha256";
          };
        in
        rec {
          default = teruko;

          teruko = pkgs.stdenvNoCC.mkDerivation {
            name = "teruko";

            src = ./.;

            nativeBuildInputs = with pkgs; [
              nodePackages.pnpm
              makeWrapper
              openssl
            ];

            PRISMA_MIGRATION_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/migration-engine";
            PRISMA_QUERY_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/query-engine";
            PRISMA_QUERY_ENGINE_LIBRARY = "${pkgs.prisma-engines}/lib/libquery_engine.node";
            PRISMA_INTROSPECTION_ENGINE_BINARY = "${pkgs.prisma-engines}/bin/introspection-engine";
            PRISMA_FMT_BINARY = "${pkgs.prisma-engines}/bin/prisma-fmt";

            postConfigure = ''
              export HOME=$(mktemp -d)
              export STORE_PATH=$(mktemp -d)

              cp -Tr "${pnpmDeps}" "$STORE_PATH"
              chmod -R +w "$STORE_PATH"

              pnpm config set store-dir "$STORE_PATH"

              pnpm install --offline -r

              patchShebangs node_modules/{*,.*}
            '';

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
          };
        }
      );

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
