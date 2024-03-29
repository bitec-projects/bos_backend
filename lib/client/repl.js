var internalClient = require("../internal-client"),
    _open = require("../util/open");

var server;

module.exports = function (bosBackend) {
    console.log("type help for a list of commands");
    var repl = require("repl"),
        context = repl.start("bosbackend > ", null, replEval, true, true).context;
    server = bosBackend;

    context.bosBackend = buildReplClient(bosBackend);

    return commands;
};

function replEval(src, ctx, name, fn) {
    /*jshint evil:true*/
    var result;

    // first try to match a command
    // trim '(',')', and '\n'
    if (tryCommand(src.replace(/\(|\)|\n/g, ""))) {
        fn();
    } else {
        try {
            result = eval(src);
        } catch (e) {}
        fn(null, result);
    }
}

var commands = {
    help: function () {
        function pad(key) {
            var len = 0,
                padding = "";
            Object.keys(help).forEach(function (key) {
                if (key.length > len) len = key.length;
            });
            len -= key.length;
            len += 10;
            while (padding.length < len) {
                padding += " ";
            }
            return padding;
        }

        Object.keys(help).forEach(function (key) {
            console.log("\t" + key + pad(key) + help[key]);
        });
    },

    resources: function () {
        server.resources &&
            server.resources.forEach(function (r) {
                if (r.config.type) console.log("\t" + r.path, "(" + r.config.type + ")");
            });
    },

    dashboard: function () {
        open("/dashboard/");
    },

    open: function () {
        open();
    },
};

function open(url) {
    url = url || "";
    _open("http://localhost:" + server.options.port + url);
}

var help = {
    dashboard: "open the resource editor in a browser",
    bosBackend: "the server object",
    resources: "list your resources",
};

function tryCommand(cmd) {
    console.info(cmd);
    if (commands[cmd]) {
        return commands[cmd]() || true;
    }
}

function buildReplClient(bbe) {
    var client = internalClient.build(bbe, { isRoot: true });

    Object.keys(client).forEach(function (key) {
        Object.keys(client[key]).forEach(function (k) {
            var orig = client[key][k];
            client[key][k] = function () {
                var args = Array.protoype.slice.call(arguments);
                if (typeof args[args.length - 1] !== "function") {
                    args[args.length] = function (res, err) {
                        if (err) {
                            console.log("Error", err);
                        } else {
                            console.log(res);
                        }
                    };
                    args.length++;
                }
                orig.apply(client[key], args);
            };
        });
    });

    return client;
}
