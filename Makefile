GREEN  := $(shell tput -Txterm setaf 2)
WHITE  := $(shell tput -Txterm setaf 7)
YELLOW := $(shell tput -Txterm setaf 3)
RESET  := $(shell tput -Txterm sgr0)
ARCH   := $(shell uname -m)

# Building image usage
DOCKER_NS ?= zhouguohao
BASENAME ?= $(DOCKER_NS)/electricity
VERSION ?= 1.0.0
IS_RELEASE=false

BASE_VERSION ?= $(ARCH)-$(VERSION)

ifeq ($(IS_RELEASE),false)
	EXTRA_VERSION ?= snapshot-$(shell git rev-parse --short HEAD)
	IMG_TAG=$(BASE_VERSION)-$(EXTRA_VERSION)
else
	IMG_TAG=$(BASE_VERSION)
endif

# Docker images needed to run cello services
DOCKER_IMAGES = website
DUMMY = .$(IMG_TAG)

# Specify the running mode, prod or dev
MODE ?= prod
ifeq ($(MODE),prod)
	COMPOSE_FILE=docker-compose-files/docker-compose.yml
else
	COMPOSE_FILE=docker-compose-files/docker-compose-dev.yml
endif

build/docker/website/$(DUMMY): build/docker/website/$(DUMMY)

build/docker/%/$(DUMMY): ##@Build an image locally
	$(eval TARGET = ${patsubst build/docker/%/$(DUMMY),%,${@}})
	$(eval IMG_NAME = $(BASENAME)-$(TARGET))
	@mkdir -p $(@D)
	@echo "Building docker $(TARGET)"
	@cat docker/$(TARGET)/Dockerfile.in \
		| sed -e 's|_DOCKER_BASE_|$(DOCKER_BASE)|g' \
		| sed -e 's|_NS_|$(DOCKER_NS)|g' \
		| sed -e 's|_TAG_|$(IMG_TAG)|g' \
		> $(@D)/Dockerfile
	docker build -f $(@D)/Dockerfile \
		-t $(IMG_NAME) \
		-t $(IMG_NAME):$(IMG_TAG) \
		. ;
	@touch $@ ;

build/docker/%/.push: build/docker/%/$(DUMMY)
	@docker login \
		--username=$(DOCKER_HUB_USERNAME) \
		--password=$(DOCKER_HUB_PASSWORD)
	@docker push $(BASENAME)-$(patsubst build/docker/%/.push,%,$@):$(IMG_TAG)

docker: $(patsubst %,build/docker/%/$(DUMMY),$(DOCKER_IMAGES)) ##@Generate docker images locally

docker-website: build/docker/website/$(DUMMY)

docker-clean: stop image-clean ##@Clean all existing images

clean: ##@Code Clean tox result
	rm -rf .tox .cache *.egg-info build/

image-clean: clean ##@Clean all existing images to rebuild
	echo "Clean all images, may need to remove all containers before"
	docker images | grep "zhouguohao/electricity-" | awk '{print $3}' | xargs docker rmi -f

start: ##@Service Start service
	@$(MAKE) $(START_OPTIONS)
	echo "Start all services with ${COMPOSE_FILE}... docker images must exist local now, otherwise, run 'make docker first' !"
	docker-compose -f ${COMPOSE_FILE} up -d --no-recreate
	echo "Now you can visit website at localhost:8081"

stop: ##@Service Stop service
	echo "Stop all services with ${COMPOSE_FILE}..."
	docker-compose -f ${COMPOSE_FILE} stop
	echo "Remove all services with ${COMPOSE_FILE}..."
	docker-compose -f ${COMPOSE_FILE} rm -f -a

restart: stop start ##@Service Restart service

.PHONY: \
	clean \
	docker \
	docker-clean \
	restart \
	start \
	stop