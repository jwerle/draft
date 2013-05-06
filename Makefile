all: clean install test build

build:
	@component build --dev

components: component.json
	@component install --dev

clean:
	@rm -rf ./node_modules
	@rm -rf build components template.js

install:
	@npm install .

test: install
	@./node_modules/mocha/bin/mocha -R spec

.PHONY: all clean install test components