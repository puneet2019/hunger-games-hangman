.PHONY: start stop

PORT ?= 8000
PID_FILE := .server.pid

start:
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		echo "Server already running on http://localhost:$(PORT) (PID $$(cat $(PID_FILE)))"; \
	else \
		python3 -m http.server $(PORT) & echo $$! > $(PID_FILE); \
		echo "Server started on http://localhost:$(PORT) (PID $$!)"; \
	fi

stop:
	@if [ -f $(PID_FILE) ] && kill -0 $$(cat $(PID_FILE)) 2>/dev/null; then \
		kill $$(cat $(PID_FILE)) && rm -f $(PID_FILE); \
		echo "Server stopped."; \
	else \
		rm -f $(PID_FILE); \
		echo "No server running."; \
	fi
