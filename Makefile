clean_cache:
	pio run -t clean

reinstall_deps:
	rm -rf .pio
	pio lib install

upload_receiver:
	pio run -t upload -e receiver

upload_know_mac:
	pio run -t upload -e know_mac

upload_sender:
	pio run -t upload -e sender

