# Integrated Online Messaging (IOM)

Integrated Online Messaging (IOM) is the technique of integrating internal content with external content on an ey.com page. Only EY users with access to the EY intranet can see the internal content. All other users see only the external content.

## Getting Started

1. Place the following in a .js hosted on the intranet server https://acm.us.na.ey.net/iom/
```
/* Last Updated YYYY-MM-DD by NAME */
var internalContent = {
	navLinks: [
		{ area: "", name: "", url: "" }
	],
	content: {
		"PAGE-NAME-1": {
			"INTERNAL-CONTENT-ITEM-1": {
				html: '<p>Example of internal content shown on an external page</p>'
			}
		},
		"PAGE-NAME-2": {
			"INTERNAL-CONTENT-ITEM-2": {
				label: "Winning in the Market CHS",
				url: "http://chs.ey.net/servlet/CHSRenderingServlet?chsReplicaID=852575210049BF89"
			},
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
			}
		}
	}
}
```
2. Insert placeholders in the ey.com external page, such as these examples:
```
<section class="iom" data-content-id="INTERNAL-CONTENT-ITEM-1"></section>
<span class="iom" data-content-id="INTERNAL-CONTENT-ITEM-2"></span>
```
3. Add this script reference to your page:
```
<script src="http://cdn.ey.com/assets/js/ey/iom.min.js" type="text/javascript"></script>
```
4. Call this script from the external ey.com page, replacing the URL with the internal script for your site:
```
IOM.init("http://acm.us.na.ey.net/iom/INTERNAL-CONTENT-SCRIPT.js");
```

## What IOM is and how it works:

The external web page contains placedholders that reference internal content. However, the contents of an internally-hosted
script file contains the actual internal content, including links to intranet sites. Therefore, the "internal information"
exposed to the public is nothing more than abstract references in the placeholders, such as the following:
```
<section class="iom" data-content-id="INTERNAL-CONTENT-ITEM-1"></section>
<div class="iom" data-content-id="INTERNAL-VIDEO"></div>
```
The placeholder is any HTML element with a class of "iom" and a custom data attribute called "data-content-id".

The internal script file is a JSON-formatted script file with specific structures identifying the internal content.
See example above.

Items inside of the "navLinks" array will be appended to the navigation menu of an ACTv2 page.

The "email", "linkedin" and "twitter" properties are used to automatically display social share options
to EY users at the top of the ACTv2 center column.

In some cases, you may have a block of internal content you wish to use on several different pages. You can do this
by referencing the page name and content id from the placeholder as follows:
```
<section class="iom" data-content-id="PAGE-NAME-1/INTERNAL-CONTENT-ITEM-1"></section>
```
For example:
```
<section class="iom" data-content-id="EY-CFO-program-partnering-for-performance-the-CFO-and-CIO-about-the-study/CFO and CIO take-to-client materials"></section>
```
## What IOM does:

The IOM.init() function is the only function you will use in most cases. It begins to retrieve the internal script file,
and then calls the IOM.render() function to search for matching items on the page and render them.

Events are automatically added to hyperlinks inside of internal content to track that a click on IOM content has occurred.
The event calls Analytics.TrackIOMNavigate() for this purpose.

Internal content is displayed inside of an element with the class "iom", and you can therefore create a number of
CSS rules to control how that internal content is shown. The class "iom" is set to "display: none" by default so
that non-EY users do not see any of the elements, including the placeholder.

## Testing and debugging:

After calling IOM.init(), check the following:
1. Does the IOM object exist? If not, then you are not referencing the iom.min.js script.
2. Check IOM.internalTestCompleted in the console. If 'false', then it thinks you are a non-EY user
    perhaps because it cannot retrieve the internal script file from https://acm.us.na.ey.net/iom/
   Note: for testing, you can place that internal script somewhere else temporarily such as dropbox or your
    localhost.
3. Check IOM.isEY in the console. If true, then it recognizes you as an EY user.
4. Check IOM.pageName in the console. This should match the section of content you are trying to display
    on the page. This doesn't necessarily match the page name you are currently on.

## More documentation

https://share.ey.net/sites/eycom-designandprodiction/Team%20Wiki/Integrated%20Online%20Messaging%20(IOM).aspx

## Contributing

Submit pull requests and I will review them.

## Versioning

I use a simple versioning method of date-stamping the latest change at the top of the script file. 

## Authors

* **Ben Hoffmann** - https://github.com/BenRunInBay

## License

Proprietary license is for Ernst & Young LLP use only.

