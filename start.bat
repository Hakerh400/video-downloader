@echo off
cls

if not exist "./video-downloader" (
  md "./video-downloader"
)

cd "./video-downloader"
call npm i "@hakerh400/video-downloader"
call node "./node_modules/@hakerh400/video-downloader" || pause