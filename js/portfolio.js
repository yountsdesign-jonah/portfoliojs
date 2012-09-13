/*
 *
 * jQuery Gallering Plugin
 *
 * Copyright (c) 2012 Abhinay Omkar (http://abhiomkar.in)
 * Licensed under the MIT License:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * */

;(function($) {

    var defaults = {
        autoplay: false,
        firstLoadCount: 4,
        enableKeyboardNavigation: true,
        loop: false,
        easingMethod: 'easeOutQuint',
        height: '500px',
        lightbox: false,
        showArrows: true
    },
    currentViewingImage,
    totalLoaded = 0,
    offset_left = 6,
    imageLoadedCalled = false
;

    // prototypes
    /* sum */
    Array.prototype.sum = function() {
        return this.reduce(function(a,b){return a+b;});
    }

    $.fn.portfolio = function(settings) {
        
        var portfolio = this, gallery = this;

        $.extend(this, {
            version: "0.1v",
            init: function() {

                // CSS Base
                $(this).css({
                    width: '100%',
                    height: portfolio.height,
                    'overflow-x': 'scroll',
                    'overflow-y': 'hidden',
                    position: 'relative'
                });

                $(this).find('img').css({
                    position: 'absolute',
                    display: 'inline-block',
                    height: portfolio.height
                });

                $(this).find("img").css('display', 'none');
                // end

                // set all images element attribute loaded to false and hide, bcoz the
                // game is not yet started :)
                $(this).find("img").attr('loaded', 'false');
                // end

                // mark first & last images
                $(this).find("img").first().attr('first', 'true');
                $(this).find("img").last().attr('last', 'true');
                // end

                // set positions for each image
                $(this).find("img").each(function(index) {
                    $(this).data('position', index);
                });
                // end

                // spinner
                // show spinner while the images are being loaded...
                portfolio.spinner.show('100%');

                // load first 4 images
                portfolio.loadNextImages(portfolio.firstLoadCount);
                
                // First Image
                currentViewingImage = $(this).find("img").first();
                $(currentViewingImage).addClass('active');

                if (portfolio.lightbox) {
                    $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                    $(gallery).find('img.active').animate({opacity: '1'});
                }

                // Show Arrows
                if (portfolio.showArrows) {
                    portfolio.navigation.show();
                }

                // add a 5px space at the end
                $(this).append('<div class="gallery-blank-space"></div>');
                $('.gallery-blank-space').css({
                    position: 'absolute',
                    width: '5px',
                    height: portfolio.height,
                });

                // LionBar
                // $(this).lionbars();

                // Events

                /* Swipe Left */
                $(this).swipe( {
                    swipeLeft: function() {
                                    portfolio.next();
                                },
                    swipeRight: function() {
                                    portfolio.prev();
                                }
                });

                $(this).find('img').on('movestart', function(e) {
                    console.log('movestart');
                    if ((e.distX > e.distY && e.distX < -e.distY) ||
                        (e.distX < e.distY && e.distX > -e.distY)) {
                        e.preventDefault();
                            // portfolio.next();
                    } 
                });

                /* Click */
                $(this).find("img").click(function(event) {

                    if (currentViewingImage[0] === $(this)[0]) {
                        // If clicked on the current viewing image
                        // then scroll to next image
                        // $(gallery).find(".photo").addClass('darken-photo');
                        // $(this).next().removeClass('darken-photo');

                        // $(gallery).scrollTo($(this).next().find('img').data('offset-left'), 500, {axis: 'x'} );
                        // currentViewingImage = $(this).next().find('img');
                        portfolio.next();

                    }
                    else {
                        // clicked on the next image or particular image, scroll to that image
                        // $(gallery).find(".photo").addClass('darken-photo');
                        // $(this).removeClass('darken-photo');

                        portfolio.slideTo($(this));
                    }
                }); // click()

                $(this).scroll(function() {
                        if ($(gallery).find('img').last().attr('loaded') === 'true') {
                            $('.gallery-blank-space').css({left: $(gallery).find('img').last().data('offset-left') + $(gallery).find('img').last().width() + 'px'});
                        }

                        if (gallery[0].offsetWidth + gallery.scrollLeft() >= gallery[0].scrollWidth) {

                            if (totalLoaded < $(gallery).find('img').length) {
                                console.log('scroll ended');
                                currentViewingImage = $(gallery).find('img[loaded=true]').last();
                                portfolio.loadNextImages(6);

                            }
                        }
                });

            }, // init

            next: function() {

                // console.log($(currentViewingImage).nextAll('img[loaded=false]').first().data('position'), $(currentViewingImage).data('position'));
                var distance = $(currentViewingImage).nextAll('img[loaded=false]').first().data('position') - $(currentViewingImage).data('position');

                console.log(distance);
                if(distance < 4) {
                    console.log('next: preload next 4 images');
                    portfolio.loadNextImages(6);
                }

                if($(currentViewingImage).attr('last') === 'true') {

                    // if on last image and if loop is on 
                    if(portfolio.loop) {
                        // go to first image 
                        console.log('last', 'loop: on');

                        $(gallery).scrollTo(0, 500, {axis: 'x', easing: portfolio.easingMethod});
                        currentViewingImage = $(gallery).find('img').first();

                        $(gallery).find('img').removeClass('active');
                        $(currentViewingImage).addClass('active');

                        if (portfolio.lightbox) {
                            $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                            $(gallery).find('img.active').animate({opacity: '1'});
                        }
                    }
                    else {
                        console.log('last', 'loop: off');
                    }
                }

                // if next image is already loaded
                else if ($(currentViewingImage).next().attr('loaded') === 'true') {
                    // go to next image
                    $(gallery).scrollTo($(currentViewingImage).next().data("offset-left") - 5, 800, {axis: 'x', easing: portfolio.easingMethod});
                    currentViewingImage = $(currentViewingImage).next();

                    $(gallery).find('img').removeClass('active');
                    $(currentViewingImage).addClass('active');

                    if (portfolio.lightbox) {
                        $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                        $(gallery).find('img.active').animate({opacity: '1'});
                    }

                }
                // if next image is not yet loaded
                else if ($(currentViewingImage).next().attr('loaded') === 'false') {
                    // show the spinner and prepare to load next images
                    console.log('next images are being loaded...');
                }

                /*
                if (gallery.offsetWidth + gallery.scrollLeft >= gallery.scrollWidth) {
                    console.log('scrollEnd');
                    var spinner_target = $(currentViewingImage).after('<span class="spinner-container"></span>');
                    $(gallery).scrollTo($(currentViewingImage).data("offset-left") + 100, 500, {axis: 'x'});
                    portfolio.spinner(spinner_target);
                }
                */
                console.log('next: current viewing image', currentViewingImage);
            },

            prev: function() {
                if($(currentViewingImage).attr('first') === 'true') {
                    // If on first Image stay there, do not scroll
                }
                else {
                    // go to prev image
                    $(gallery).scrollTo($(currentViewingImage).prev().data("offset-left") - 5, 500, {axis: 'x', easing: portfolio.easingMethod});
                    currentViewingImage = $(currentViewingImage).prev();

                    $(gallery).find('img').removeClass('active');
                    $(currentViewingImage).addClass('active');

                    if (portfolio.lightbox) {
                        $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                        $(gallery).find('img.active').animate({opacity: '1'});
                    }
                }

                console.log('prev: current viewing image', currentViewingImage);
            },

            slideTo: function(img) {
                scrollLeftTarget = $(img).data('offset-left');

                $(gallery).scrollTo(scrollLeftTarget - 5, 500, {axis: 'x', easing: portfolio.easingMethod});
                currentViewingImage = $(img);

                $(gallery).find('img').removeClass('active');
                $(currentViewingImage).addClass('active');

                if (portfolio.lightbox) {
                    $(gallery).find('img').not('.active').animate({opacity: '0.2'});
                    $(gallery).find('img.active').animate({opacity: '1'});
                }

                console.log($(currentViewingImage));
            },

            spinner: {
                remove: function() {
                    $(gallery).find('.spinner-container').remove();
                },

                show: function(width) {
                    // Spinner
                    portfolio.spinner.remove();

                    var lastImg = $(gallery).find('img[loaded=true]').last();
                    $(gallery).append('<span class="spinner-container"></span>');
                    $(gallery).find('.spinner-container').css({
                        display: 'inline-block',
                        position: 'absolute',
                        height: portfolio.height,
                        width: width,
                        left: $(lastImg).data('offset-left') + $(lastImg).data('width') + 5 + 'px'
                    });

                    var opts = {
                        lines: 17, // The number of lines to draw
                        length: 4, // The length of each line
                        width: 2, // The line thickness
                        radius: 5, // The radius of the inner circle
                        corners: 1, // Corner roundness (0..1)
                        rotate: 0, // The rotation offset
                        color: '#000', // #rgb or #rrggbb
                        speed: 1.5, // Rounds per second
                        trail: 72, // Afterglow percentage
                        shadow: false, // Whether to render a shadow
                        hwaccel: false, // Whether to use hardware acceleration
                        className: 'spinner', // The CSS class to assign to the spinner
                        zIndex: 2e9, // The z-index (defaults to 2000000000)
                        top: '250px', // Top position relative to parent in px
                        left: 'auto' // Left position relative to parent in px
                    };

                    var spinner = new Spinner(opts).spin($(gallery).find('.spinner-container')[0]);
                }
            },

            loadNextImages: function(count) {
                    // console.log('loading...', totalLoaded, count, $(gallery).find(".photo img").slice(totalLoaded, totalLoaded + count));
                if (!imageLoadedCalled) {
                    var nextImages;
                    if(currentViewingImage === undefined) {
                        // load first few pictures - gallery init
                        nextImages = $(gallery).find("img[loaded=false]").slice(0, count);
                        $(nextImages).each(function(index) {
                            // current img element
                            var cur_img = this;

                            cur_img.src = $(cur_img).data('src');
                            $(cur_img).attr('loaded', 'loading');
                        }); // each()
                    }
                    else {
                        // load next few pictures - 'count'
                        nextImages = $(currentViewingImage).nextAll("img").slice(0, count).filter('img[loaded=false]');
                        $(nextImages).each(function(index) {
                            // current img element
                            var cur_img = this;

                            cur_img.src = $(cur_img).data('src');
                            $(cur_img).attr('loaded', 'loading');
                        }); // each()
                    }

                     // .imagesLoaded callback on images having src attribute but not loaded yet
                     // on otherwords, filter only loading images
                     $(nextImages).imagesLoaded(function($img_loaded){

                        console.log('images loaded:');
                        console.log($img_loaded);
                        $img_loaded.each(function(index) {
                            var img = this;
                            $(img).data('offset-left', offset_left);

                            // Inorder to fadeIn effect to work, make the new
                            // img element invisible by 'display: none'
                            $(img).css({'left': offset_left+'px', 'display': 'none'});
                            portfolio.spinner.remove();
                            $(img).fadeIn('slow');

                            img_width = $(img).width();
                            console.log('img_width: ', img_width);


                            offset_left += img_width + 5;

                            totalLoaded += 1;
                            // console.log('totalLoaded', totalLoaded)

                            $(img).data('width', img_width);
                            $(img).attr('loaded', 'true');

                        }); // each()

                        portfolio.spinner.show('100px');
                        // $(gallery).find('.spinner-container').css({'width': '100px', 'left': (offset_left+10)+'px'}).show();
                        if (totalLoaded === $(gallery).find('img').length) {
                            portfolio.spinner.remove();
                           // $(gallery).find('.spinner-container').css({'left': (offset_left+10)+'px'}).hide();
                        }
                        imageLoadedCalled = false;

                    }); // imagesLoaded()

                    imageLoadedCalled = true;
                } // if(!imageLoadedCalled)
  
            }, // loadNextImages
            navigation: {
                show: function() {
                    if (portfolio.navigation.created) {
                        // arrows already exists, do not create again
                        $('.gallery-arrow-left, .gallery-arrow-right').show();
                        $('.gallery-arrow-left, .gallery-arrow-right').delay(6000).fadeOut();
                    }
                    else {
                        // create arrows
                        $(gallery).before('<span class="gallery-arrow-left"></span>').after('<span class="gallery-arrow-right"></span>');
                        $(gallery).prev('.gallery-arrow-left').css({
                            position: 'absolute',
                            left: '8px',
                            height: '500px',
                            width: '50px',
                            'z-index': '9999',
                            // inline image for arrow-left
                            background: "url(data:image/png;base64,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) center left no-repeat",
                            'background-position': '8px',
                            opacity: '0.5'
                        });
                        $(gallery).next('.gallery-arrow-right').css({
                            position: 'absolute',
                            left: $(gallery).width() - 50,
                            top: $(gallery).position().top,
                            height: '500px',
                            width: '50px',
                            'z-index': '9999',
                            // inline image for arrow-right
                            background: "url(data:image/png;base64,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) center left no-repeat",
                            'background-position': '8px',
                            opacity: '0.5'
                        });

                        $(gallery).prev('.gallery-arrow-left').click(function(e) {
                            portfolio.prev();
                        });

                        $(gallery).next('.gallery-arrow-right').click(function(e) {
                            portfolio.next();
                        });

                        $('.gallery-arrow-left, .gallery-arrow-right').hover(function(){
                            // Mouse In
                            $(this).css({ 'opacity': '1' });
                        }, 
                        function() {
                            // Mouse Out
                            $(this).css({ 'opacity': '0.5' });
                        }); // hover()

                        $(gallery).mousemove(function(){
                            portfolio.navigation.show();
                        });

                        $('.gallery-arrow-left, .gallery-arrow-right').delay(6000).fadeOut();
                        portfolio.navigation.created = true;

                    } // if.. else..
                }, // show() 

                hide: function() {
                    $('.gallery-arrow-left, .gallery-arrow-right').fadeOut();
                }, // hide()
                created: false
            } // navigation
        }); // extend()

        $.extend(this, defaults, settings);

        if (this.enableKeyboardNavigation) {
                $(document).keydown(function(e) {
                        var key = e.charCode ? e.charCode : e.keyCode ? e.keyCode : 0;
                        switch(key) {
                                case 73: // 'i' key
                                         // go to first slide
                                        portfolio.slideTo($(gallery).find('img').first());
                                        break;
                                case 91: // 'a' key
                                         // go to last slide
                                        portfolio.slideTo($(gallery).find('img').last());
                                        break;

                                case 75: // 'k' key
                                case 37: // left arrow
                                        portfolio.navigation.hide();
                                        portfolio.prev();
                                        e.preventDefault();
                                        break;
                                case 74: // 'j' key
                                case 39: // right arrow
                                        portfolio.navigation.hide();
                                        portfolio.next();
                                        e.preventDefault();
                                        break;
                        }
                });
        }

        return this;
    }

})(jQuery);
