.PHONY: start stop deploy

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

deploy:
	git add -A
	git commit -m "Deploy to GitHub Pages" || true
	git push origin main
	gh api repos/{owner}/{repo}/pages -X PUT -f build_type=workflow -f source='{"branch":"main","path":"/"}' 2>/dev/null || \
		gh api repos/{owner}/{repo}/pages -X POST -f build_type=legacy -f source='{"branch":"main","path":"/"}' 2>/dev/null || \
		echo "Pages may already be configured. Check https://puneet2019.github.io/hunger-games-hangman/"
	@echo ""
	@echo "Site will be live at: https://puneet2019.github.io/hunger-games-hangman/"
