/* Integrated Online Messaging 2017-04-21b
    Requires: jquery, analytics

    DO NOT USE THIS SCRIPT DIRECTLY.
    Instead, use the minified version:
        http://cdn.ey.com/assets/js/ey/iom.min.js

    Purpose:
        Integrated Online Messaging (IOM) is the technique of integrating internal content with external content on an ey.com page.
        Only EY users with access to the EY intranet can see the internal content. All other users see only the external content.

    Documentation:
        https://share.ey.net/sites/eycom-designandprodiction/Team%20Wiki/Integrated%20Online%20Messaging%20(IOM).aspx

    Getting started using IOM on a web page:

        1. Place the following in a .js hosted on the intranet server https://acm.us.na.ey.net/iom/

        	var internalContent = {
        		navLinks: [
        			{ name: "", url: "", area: "", countryCode: "" }
        		],
        		content: {
        			"PAGE-NAME-1": {
        				"INTERNAL-CONTENT-ITEM-1": {
        					html: '<p>Example of internal content shown on an external page</p>'
        				}
        			},
        			"PAGE-NAME-2": {
                        email: {
                            url: ""
                        },
                        twitter: {
                            tweet: "",
                            url: "",
                            handle: "EYNews"
                        },
                        linkedin: {
                            post: "",
                            url: ""
                        },
                        "INTERNAL-CONTENT-ITEM-2": {
                            label: "Winning in the Market CHS",
                            url: "http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852575210049BF89"
                        }
                    }
        		}
        	}

        2. Insert placeholders in the ey.com external page, such as these examples:
        	<section class="iom" data-content-id="INTERNAL-CONTENT-ITEM-1"></section>
        	<span class="iom" data-content-id="INTERNAL-CONTENT-ITEM-2"></span>

        3. Add this script reference to your page:
            <script src="http://cdn.ey.com/assets/js/ey/iom.min.js" type="text/javascript"></script>

        4. Call this script from the external ey.com page, replacing the URL with the internal script for your site:
            IOM.init("http://acm.us.na.ey.net/iom/INTERNAL-CONTENT-SCRIPT.js");


    What IOM is and how it works:

        The external web page contains placedholders that reference internal content. However, the contents of an internally-hosted
        script file contains the actual internal content, including links to intranet sites. Therefore, the "internal information"
        exposed to the public is nothing more than abstract references in the placeholders, such as the following:
            <section class="iom" data-content-id="INTERNAL-CONTENT-ITEM-1"></section>
            <div class="iom" data-content-id="INTERNAL-VIDEO"></div>

        The placeholder is any HTML element with a class of "iom" and a custom data attribute called "data-content-id".

        The internal script file is a JSON-formatted script file with specific structures identifying the internal content.
        See example above.

        Items inside of the "navLinks" array will be appended to the navigation menu of an ACTv2 page.

        The "email", "linkedin" and "twitter" properties are used to automatically display social share options
        to EY users at the top of the ACTv2 center column.

        In some cases, you may have a block of internal content you wish to use on several different pages. You can do this
        by referencing the page name and content id from the placeholder as follows:
            <section class="iom" data-content-id="PAGE-NAME-1/INTERNAL-CONTENT-ITEM-1"></section>
        For example:
            <section class="iom" data-content-id="EY-CFO-program-partnering-for-performance-the-CFO-and-CIO-about-the-study/CFO and CIO take-to-client materials"></section>


    What IOM does:

        The IOM.init() function is the only function you will use in most cases. It begins to retrieve the internal script file,
        and then calls the IOM.render() function to search for matching items on the page and render them.

        Events are automatically added to hyperlinks inside of internal content to track that a click on IOM content has occurred.
        The event calls Analytics.TrackIOMNavigate() for this purpose.

        Internal content is displayed inside of an element with the class "iom", and you can therefore create a number of
        CSS rules to control how that internal content is shown. The class "iom" is set to "display: none" by default so
        that non-EY users do not see any of the elements, including the placeholder.

    Testing and debugging:

        After calling IOM.init(), check the following:
            1. Does the IOM object exist? If not, then you are not referencing the iom.min.js script.
            2. Check IOM.internalTestCompleted in the console. If 'false', then it thinks you are a non-EY user
                perhaps because it cannot retrieve the internal script file from https://acm.us.na.ey.net/iom/
               Note: for testing, you can place that internal script somewhere else temporarily such as dropbox or your
                localhost.
            3. Check IOM.isEY in the console. If true, then it recognizes you as an EY user.
            4. Check IOM.pageName in the console. This should match the section of content you are trying to display
                on the page. This doesn't necessarily match the page name you are currently on.



*/
var internalContent = internalContent || {};

var IOM = (function() {

    // private properties and methods
    var pvt = {
        CSS: '<style>section.iom { display: none; } '
            +'.iom div { border: 3px solid #00a3ae !important; padding: 3px; } '
            +'.iom h3 { color: white !important; background-color: #00a3ae !important; padding: 3px; } '
            +'.iom p.email { margin-left: 20px; } '
            +'.iom p.twitter { margin-left: 20px; } '
            +'.iom p.linkedin { margin-left: 20px; } '
            +'a.iom { color: white !important; background-color: #00a3ae !important; padding: 3px; } '
            +'#featuremenu li.iom a { color: white !important; background-color: #00a3ae !important; } '
            +'#featuremenu li.iom a:hover { color: black !important; background-color: #00a3ae !important; } '
            +'#featuremenu li.iom span { color: white !important; font-size: 70% !important; } '
            +'@media print { .iom { display: none !important; } } '
            +'</style>',
        /*
            The IOM.render() function looks for 3 types of content in the internal script file:
                1. internalContent.navLinks: an array of links that will be appended to an ey.com page's left-hand navigation
                2. internalContent.content: an object containing other internal content that is matched to the current page
                3. internalContent.content: placeholders can reference internal content for other pages

            Events are automatically added to hyperlinks inside of internal content to track that a click on IOM content has occurred.
            The event calls Analytics.TrackIOMNavigate() for this purpose.

        */
        render: function() {
            if (IOM.active) {
                IOM.isEY = true;
                IOM.internalTestCompleted = true;
                try {
                    if (internalContent.navLinks && IOM.navRendered==false) $.each(internalContent.navLinks, function(i, v) {
                        if (v!=null && (v.area==IOM.area || v.area==null || v.area=='')
                                    && (v.countryCode==IOM.countryCode || v.countryCode==null || v.countryCode=='')) {
                            $('#featuremenu li:last').after('<li class="iom"><a onclick="IOM.track(this); return(true)" href="'
                                +v.url+'" target="internal">'
                                +v.name+IOM.navNotice+'</a></li>');
                        }
                        IOM.navRendered = true;
                    });

                    // render IOM items found on this page
                    var contentForThisPage = pvt.getItemByPropName(internalContent.content, IOM.pageName);
                    if (contentForThisPage!=null) {

                        IOM.pageMatches = true;

                        var shareHtml = '', social = false;

                        // render email this report message
                        if (contentForThisPage.email!=null && contentForThisPage.email.url!=null) {
                            shareHtml += '<p class="email"><a href="#" onclick="IOM.shareEmail(this, \''+contentForThisPage.email.url+'\'); return(false)">'
                                        +IOM.emailNotice;
                        }

                        // social share options
                        if (contentForThisPage.twitter!=null) {
                            shareHtml += 
                                    '<p class="twitter"><a href="#" onclick="IOM.shareTwitter(this, \''+contentForThisPage.twitter.url+'\', \''+contentForThisPage.twitter.handle+'\'); return(false)" title="Twitter">'
                                    +'<img alt="Twitter button" src="http://cdn.ey.com/assets/images/twitter-button.png"> '
                                    +contentForThisPage.twitter.tweet+'</a></li></ul>';
                            social = true;
                        }
                        if (contentForThisPage.linkedin!=null) {
                            shareHtml +=
                                    '<p class="linkedin"><a href="#" onclick="IOM.shareLinkedIn(this, \''+contentForThisPage.linkedin.url+'\'); return(false)" title="LinkedIn">'
                                    +'<img alt="LinkedIn button" src="http://cdn.ey.com/assets/images/linkedin-button.png"> '
                                    +contentForThisPage.linkedin.post+'</a></li></ul>';
                            social = true;
                        }
                        if (shareHtml.length>0) {
                            IOM.shareHtmlFinal = IOM.shareSectionHtmlTpl.replace('{{shareHtml}}'
                                , IOM.shareNotice+IOM.buildBrandNotice+shareHtml);
                            $('.socialshare').after(IOM.shareHtmlFinal);
                            $('#EYShareOptions').show();
                            if (social) $('.socialshare').hide();
                        }

                        // render in-page content
                        $('.iom').each(function() {
                            var tag = $(this).data('content-id');
                            if (tag!=null) {
                                var c = contentForThisPage[tag];
                                pvt.renderItem($(this), c, tag);
                            }
                        });
                    }

                    // render other IOM items referenced using the page-name/iom-content-id syntax
                    $('.iom').each(function() {
                        var tag = $(this).data('content-id');
                        if (tag!=null && tag.length>=3 && tag.indexOf("/")>0) {
                            try {
                                var pageName = tag.split('/')[0];
                                var tag = tag.split('/')[1];
                                contentForThisPage = pvt.getItemByPropName(internalContent.content, pageName);
                                if (contentForThisPage!=null) {
                                    IOM.otherPageMatches = true;
                                    c = contentForThisPage[tag];
                                }
                                pvt.renderItem($(this), c, tag);
                            } catch (e) {}
                        }
                    });
                    if (typeof IOM.postRenderCallback=="function") IOM.postRenderCallback.call(this);
                } catch (e) {
                    if (typeof IOM.postRenderCallback=="function") IOM.postRenderCallback.call(this);
                }
            } else if (typeof IOM.postRenderCallback=="function") IOM.postRenderCallback.call(this);
        },
        /*
            If ajax fails to retrieve internal script
        */
        fail: function() {
            IOM.isEY = false;
            IOM.internalTestCompleted = true;
            if (typeof IOM.postRenderCallback=="function") IOM.postRenderCallback.call(this);
        },
        /*
            Find a matching object item using case-insensitive matching
        */
        getItemByPropName: function(obj, matchKey) {
            var item = null;
            if (typeof obj=="object") {
                for (itemKey in obj) {
                    if (itemKey.toLowerCase()==matchKey.toLowerCase()) {
                        item = obj[itemKey];
                        break;
                    }
                }
            }
            return(item);
        },
        /*
            Render the content from the parameter 'c' to the item$ element.
            c must have either:
                c.url and c.label
                c.html
                c.text
        */
        renderItem: function(item$, c, tag) {
            if (c) {
                if (c.url!=null && c.label!=null) {
                    var html = '<a class="iom" href="'+c.url+'" target="internal" onclick="IOM.track(this, \''+tag+'\')">'+c.label+'</a>';
                    item$.html(html);
                    item$.show();
                } else if (c.html!=null) {
                    item$.html(c.html);
                    item$.find('a').attr('target', 'internal');
                    item$.find('a').click(function() { IOM.track(this) });
                    item$.show();
                } else if (c.text!=null) {
                    item$.text(c.text);
                    item$.show();
                }
            }
        }

    };

    /*
        Public properties and methods
    */
    return({
        active: true,
        internalTestCompleted: false,
    	isEY: null,
        pageMatches: null,
        otherPageMatches: null,
    	page: null, area: null, countryCode: null, internalContentSymbol: "internalContent",
        navRendered: false,
        postRenderCallback: null,
        navNotice: ' <span><br/>(This tab viewable to EY professionals only)</span>',
        shareNotice: '<h3>EY users, share this content:</h3>',
        buildBrandNotice: '<p>Build your personal brand by sharing these market insights with your professional networks.</p>',
        shareSectionHtmlTpl: '<section class="iom" id="EYShareOptions"><div>{{shareHtml}}</div><section>',
        emailNotice: '<img alt="email button" src="http://cdn.ey.com/assets/images/email-button.png"> Email this report to your contacts</a></p>',
        globalTitleToRemove: ' - EY - Global',
        shareHtmlFinal: null,


        /*
            Initialize IOM, retrieve and render the internal content.
            This function executes only if the user has access to the internal script file.

            Typical usage, which matches content based on the current URL's page name:
                IOM.init('http://acm.us.na.ey.net/iom/MY-INTERNAL-SCRIPT.js')

            Specify the page-name to match:
                IOM.init('http://acm.us.na.ey.net/iom/MY-INTERNAL-SCRIPT.js', 'About-page')

            The navLinks internal content that is appended to an ey.com page's left-hand navigation can be filtered by area or country:
                IOM.init('http://acm.us.na.ey.net/iom/MY-INTERNAL-SCRIPT.js', null, 'americas', 'us')

            A callback can be executed once the IOM content is retrieved and rendered:
                IOM.init('http://acm.us.na.ey.net/iom/MY-INTERNAL-SCRIPT.js', null, null, null, function() {
                    // do something after IOM is done, and only if it was able to retrieve the content
                    alert('Hello EY employee! Content on this page highlighted in teal is for your eyes only.');
                })

        */
    	init: function(internalContentUrl, page, area, countryCode, postRenderCallback) {
    		$('html > head').append(pvt.CSS);
            IOM.pageName = page!=null ? page : (location!=null && location.pathname!=null? location.pathname.substring(location.pathname.lastIndexOf("/")+1) : null);
    		IOM.area = area;
    		IOM.countryCode = countryCode;
            IOM.postRenderCallback = postRenderCallback;
        	if (IOM.active) $.getScript(internalContentUrl).done(pvt.render).fail(pvt.fail);
            else IOM.fail();
    	},

        /* Hide or cancel IOM display at any point */
        cancel: function() {
            IOM.active = false;
            IOM.pageName = null;
            $('.iom').hide();
            IOM.isEY = false;
            IOM.internalTestCompleted = false;
            if (typeof IOM.postRenderCallback=="function") IOM.postRenderCallback.call(this);
        },

        shareEmail: function(linkEl, url) {
             window.open(url, "internal");
             IOM.track(linkEl, "Email this report to your contacts");
        },
        shareTwitter: function(linkEl, url, handle) {
            if (url==null) url = window.location.href;
            var tweet = $(linkEl).text();
            if (tweet!=null) {
                tweet = $.trim(tweet);
                window.open('https://twitter.com/share?url='+encodeURIComponent(url) + '&text='+encodeURIComponent(tweet) + (handle!=null ? '&via='+handle : "")
                    , 'social');
                IOM.track(linkEl, 'Tweet this report to your contacts');
            }
        },

        shareLinkedIn: function(linkEl, url) {
            if (url==null) url = window.location.href;
            var title = document.title.replace(IOM.globalTitleToRemove, '');
            var post = $(linkEl).text();
            if (post!=null) {
                post = $.trim(post);
                window.open('https://www.linkedin.com/shareArticle?mini=true&title='+encodeURIComponent(title)+'&url=' + encodeURIComponent(url) 
                    + '&summary='+encodeURIComponent(post)+'&source=ey.com', 'social');
                IOM.track(linkEl, 'Post this report on LinkedIn to your contacts');
            }
        },

        track: function(linkEl, label) {
            if (typeof(Analytics)=="object") Analytics.TrackIOMNavigate(linkEl, label);
        }
    });
}());
