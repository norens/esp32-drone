clean_cache:
	pio run -t clean

reinstall_deps:
	rm -rf .pio
	pio lib install

upload_know_mac:
	pio run -t upload -e know_mac

upload_receiver:
	pio run -t upload -e receiver

upload_sender:
	pio run -t upload -e sender

upload_testSBUSSender:
	pio run -t upload -e testSBUSSender

upload_testSBUSReceiver:
	pio run -t upload -e testSBUSReceiver

