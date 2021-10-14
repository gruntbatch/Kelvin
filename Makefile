include credentials.mk

.PHONY: all
all: Kelvin.zxp

Kelvin.zxp:
	mkdir -p build
	cp $(shell git ls-files) build
	ZXPSignCmd-64bit -sign build Kelvin.zxp $(P12_CERT) $(P12_PASS)
