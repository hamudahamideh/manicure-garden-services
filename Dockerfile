FROM node:20-bookworm-slim AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock frontend/craco.config.js frontend/tailwind.config.js frontend/postcss.config.js frontend/jsconfig.json frontend/components.json ./
RUN corepack enable && yarn install --frozen-lockfile
COPY frontend/public ./public
COPY frontend/src ./src
COPY frontend/plugins ./plugins
ENV REACT_APP_BACKEND_URL=
ENV GENERATE_SOURCEMAP=false
ENV CI=true
RUN yarn build

FROM python:3.11-slim-bookworm
WORKDIR /app
ENV PYTHONUNBUFFERED=1
COPY backend/requirements-prod.txt /tmp/requirements-prod.txt
RUN pip install --no-cache-dir -r /tmp/requirements-prod.txt
COPY backend ./backend
COPY --from=frontend /app/frontend/build ./frontend/build
EXPOSE 10000
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "10000", "--app-dir", "backend"]
