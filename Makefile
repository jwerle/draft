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

test:
	@./node_modules/mocha/bin/mocha -R spec

dist: build
	@test -d ./dist && rm -rf ./dist
	@mkdir ./dist
	@touch ./dist/draft.min.js
	@cat ./dist.wrapper.header.js >> ./dist/draft.min.js
	@cat ./build/build.js >> ./dist/draft.min.js
	@cat ./dist.wrapper.footer.js >> ./dist/draft.min.js
	@cp ./dist/draft.min.js ./draft.min.js

.PHONY: all clean install test components build dist