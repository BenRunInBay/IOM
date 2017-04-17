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

