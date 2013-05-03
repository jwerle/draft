all: clean install test

clean:
	@rm -rf ./node_modules

install:
	@npm install .

test:
	@mocha -R spec

.PHONY: all clean install test