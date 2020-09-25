<!doctype html>
<html @if ($direction) dir="{{ $direction }}" @endif
      @if ($language) lang="{{ $language }}" @endif>
    <head>
        <meta charset="utf-8">
        <title>{{ $title }}</title>

        {!! $head !!}
        <style> a.PostMention { margin-left: 40px!important; } .TagsPage .TagsPage-nav .item-newDiscussion { display: none;}</style>
    </head>

    <body>
        {!! $layout !!}

        <div id="modal"></div>
        <div id="alerts"></div>

        <script>
            document.getElementById('flarum-loading').style.display = 'block';
            var flarum = {extensions: {}};
        </script>

        {!! $js !!}

        <script>
            var custom_isanonymous = false;
            document.getElementById('flarum-loading').style.display = 'none';

            try {
                flarum.core.app.load(@json($payload));
                flarum.core.app.bootExtensions(flarum.extensions);
                flarum.core.app.boot();
            } catch (e) {
                var error = document.getElementById('flarum-loading-error');
                error.innerHTML += document.getElementById('flarum-content').textContent;
                error.style.display = 'block';
                throw e;
            }
            setInterval(function () {
                if ($('.item-submit.App-primaryControl').firstChild != null && $('.item-submit.App-primaryControl').firstChild.getAttribute('title') != 'Post Private Discussion') {
                    if (!document.getElementById("anonButton")) {
                        $('.item-submit.App-primaryControl').append('<button onclick="anon()" class="Button hasIcon" style="background: darkgreen; color: white; font-weight: 700; margin-left: 8px;" id="anonButton" type="button" title="Mark Anonymous"><i class="icon fas Button-icon fa-square"></i><span class="Button-label">Mark Anonymous</span></button>');
                        if (custom_isanonymous) {
                            $('#anonButton i').removeClass('fa-square');
                            $('#anonButton i').addClass('fa-check-square');
                        } 
                } else {
                    custom_isanonymous = false;
                }}}, 1000);

            function anon() {
                if (custom_isanonymous) {
                    $('#anonButton i').removeClass('fa-check-square');
                    $('#anonButton i').addClass('fa-square');
                    custom_isanonymous = false;
                } else {
                    $('#anonButton i').addClass('fa-check-square');
                    $('#anonButton i').removeClass('fa-square');
                    custom_isanonymous = true;
                }
            }

        </script>

        {!! $foot !!}
    </body>
</html>
