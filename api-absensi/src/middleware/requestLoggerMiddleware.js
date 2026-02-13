const requestLogger = (req, res, next) => {
    const startTime = process.hrtime();

    res.on("finish", () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = (seconds * 1000 + nanoseconds / 1e6).toFixed(2); // durasi dalam ms

        let level = "info";
        if (res.statusCode >= 500) level = "error";
        else if (res.statusCode >= 400) level = "warn";
        else if (res.statusCode >= 300) level = "silent";

        if (level === "silent") return;

        const message = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;

        switch (level) {
            case "error":
                console.error(message);
                break;
            case "warn":
                console.warn(message);
                break;
            default:
                console.log(message);
                break;
        }
    });

    next();
};

module.exports = { requestLogger };
