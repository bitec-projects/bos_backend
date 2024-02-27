$(document).ready(function () {
    $(".save").click(function () {
        $("#error").hide();
        var key = $.trim($("textarea[name=key]").val());

        $.cookie("BbeSshKey", key);

        //Make sure it works
        $.ajaxSetup({
            headers: {
                "bbe-ssh-key": key || true,
            },
        });
        bbe("dashboard").get("__is-root", function (res) {
            if (res && res.isRoot) {
                window.location.reload();
            } else {
                $("#error").show();
            }
        });
    });
});
