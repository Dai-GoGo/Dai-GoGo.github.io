$(function () {
    var animateClass = 'animated pulse';

    $('article .article, #myGallery .photo').hover(function () {
        $(this).addClass(animateClass);
    }, function () {
        $(this).removeClass(animateClass);
    });

    if ($.fn.sidenav) {
        $('.sidenav').sidenav();
    }

    function fixPostCardWidth(srcId, targetId) {
        var srcDiv = $('#' + srcId);
        var targetDiv = $('#' + targetId);
        if (!srcDiv.length || !targetDiv.length) {
            return;
        }

        var width = srcDiv.width();
        if (width >= 450) {
            width += 21;
        } else if (width >= 350) {
            width += 18;
        } else if (width >= 300) {
            width += 16;
        } else {
            width += 14;
        }
        targetDiv.width(width);
    }

    function fixFooterPosition() {
        $('.content').css('min-height', Math.max(window.innerHeight - 165, 320));
    }

    function fixStyles() {
        fixPostCardWidth('artDetail', 'prenext-posts');
        fixFooterPosition();
    }

    function debounce(fn, wait) {
        var timer = null;
        return function () {
            clearTimeout(timer);
            timer = setTimeout(fn, wait);
        };
    }

    fixStyles();
    $(window).on('resize', debounce(fixStyles, 120));

    if ($.fn.masonry && $('#articles').length) {
        $('#articles').masonry({
            itemSelector: '.article'
        });
    }

    if (window.AOS) {
        AOS.init({
            easing: 'ease-in-out-sine',
            duration: 700,
            delay: 100
        });
    }

    $('#articleContent a').attr({
        target: '_blank',
        rel: 'noopener noreferrer'
    });

    $('#articleContent img').each(function () {
        var $img = $(this);
        if ($img.parent('.img-item').length) {
            return;
        }

        var imgPath = $img.attr('src');
        var captionText = $img.attr('alt') || $img.attr('title') || '';
        $img.wrap('<div class="img-item" data-src="' + imgPath + '" data-sub-html=".caption"></div>');
        $img.addClass('img-shadow img-margin');

        if (captionText) {
            $('<div class="caption"><b class="center-caption"></b></div>')
                .find('b')
                .text(captionText)
                .end()
                .insertAfter($img);
        }
    });

    if ($.fn.lightGallery && $('#articleContent .img-item, #myGallery .img-item').length) {
        $('#articleContent, #myGallery').lightGallery({
            selector: '.img-item',
            subHtmlSelectorRelative: true
        });
    }

    var progressElement = window.document.querySelector('.progress-bar');
    if (progressElement && window.ScrollProgress) {
        new ScrollProgress(function (x, y) {
            progressElement.style.width = y * 100 + '%';
        });
    }

    if ($.fn.modal) {
        $('.modal').modal();
    }

    $('#backTop').click(function () {
        $('body,html').animate({scrollTop: 0}, 400);
        return false;
    });

    var $nav = $('#headNav');
    var $backTop = $('.top-scroll');

    function showOrHideNavBg(position) {
        if (position < 100) {
            $nav.addClass('nav-transparent');
            $backTop.slideUp(300);
        } else {
            $nav.removeClass('nav-transparent');
            $backTop.slideDown(300);
        }
    }

    showOrHideNavBg($(window).scrollTop());
    $(window).scroll(function () {
        showOrHideNavBg($(window).scrollTop());
    });

    $('.nav-menu>li').hover(function () {
        $(this).children('ul').stop(true, true).show();
        $(this).addClass('nav-show').siblings('li').removeClass('nav-show');
    }, function () {
        $(this).children('ul').stop(true, true).hide();
        $('.nav-item.nav-show').removeClass('nav-show');
    });

    $('.m-nav-item>a').on('click', function () {
        var $subMenu = $(this).next('ul');
        if (!$subMenu.length) {
            return true;
        }

        if ($subMenu.css('display') === 'none') {
            $('.m-nav-item').children('ul').slideUp(300);
            $subMenu.slideDown(100);
            $(this).parent('li').addClass('m-nav-show').siblings('li').removeClass('m-nav-show');
        } else {
            $subMenu.slideUp(100);
            $('.m-nav-item.m-nav-show').removeClass('m-nav-show');
        }
        return false;
    });

    if ($.fn.tooltip) {
        $('.tooltipped').tooltip();
    }
});
