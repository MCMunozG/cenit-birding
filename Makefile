.PHONY: up down migrate seed prepare fresh test
up: ; docker compose up -d
down: ; docker compose down
migrate: ; bash bin/cenit migrate
seed: ; bash bin/cenit seed
prepare: ; bash bin/cenit prepare
fresh: ; bash bin/cenit fresh
test: ; bash bin/cenit test
