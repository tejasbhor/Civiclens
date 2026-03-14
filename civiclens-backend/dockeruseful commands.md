To view the backend logs on your OCI server, you can use the built-in Docker commands. Since your application is running through `docker compose`, use the following commands from the `/opt/civiclens` directory:

### 1. View the most recent logs
This shows the last chunk of logs and then exits:
```bash
sudo docker compose logs backend
```

### 2. Tail/Follow the logs (Real-time)
This is best for debugging while you are clicking around the website. It will "stream" the logs to your terminal as they happen:
```bash
sudo docker compose logs -f backend
```

### 3. View the last 100 lines
If the logs are too long, you can limit them:
```bash
sudo docker compose logs --tail=100 backend
```

### 4. Check status of all containers
If you want to see if the backend is even running or if it crashed:
```bash
sudo docker compose ps
```

> [!TIP]
> If you see `Error: No such service: backend`, make sure you are in the directory where your [docker-compose.yml](cci:7://file:///d:/Civiclens/docker-compose.yml:0:0-0:0) file is located (usually `/opt/civiclens`).