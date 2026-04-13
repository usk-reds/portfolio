@echo off
cd /d "%~dp0"

echo Starting FOCUS...
start "FOCUS Server" java -jar todo-backend\target\todo-backend-0.0.1-SNAPSHOT.jar

echo Waiting for server to start...
timeout /t 5 /nobreak > nul

start http://localhost:8080
