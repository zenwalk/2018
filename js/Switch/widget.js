define("dojo/Evented dojo/_base/array dojo/_base/declare dojo/_base/lang dojo/dom-class dojo/dom-construct dojo/dom-style dojo/on dijit/_WidgetBase dijit/_TemplatedMixin dojo/text!./templates/widget.html".split(" "), function(h, f, k, g, c, l, e, m, n, p, q) {
    return k("Switch", [n, p, h], {
        declaredClass: "esri.widgets.Switch",
        templateString: q,
        css: {
            root: "esri-switch"
        },
        labels: [],
        value: 0,
        percent: 100,
        constructor: function(a) {
            this.labels = a.labels;
            this.value = a.value
        },
        postCreate: function() {
            this.inherited(arguments);
            this.percent = 100 / this.labels.length;
            e.set(this.thumbNode, "width", this.percent + "%");
            f.forEach(this.labels, g.hitch(this, function(a, d) {
                var b = l.create("div", {
                    id: "label_" + d,
                    innerHTML: "<span>" + a + "</span>"
                }, this.labelsNode);
                c.add(b, "label");
                0 === d && c.add(b, "labelOn");
                e.set(b, "width", this.percent + "%");
                m(b, "click", g.hitch(this, this.toggle, d))
            }))
        },
        startup: function() {},
        destroy: function() {
            this.inherited(arguments)
        },
        toggle: function(a) {
            this.value = a;
            e.set(this.thumbNode, "left", this.percent * a + "%");
            f.forEach(this.labels, function(d, b) {
                a === b ? c.add("label_" + b, "labelOn") : c.remove("label_" + b, "labelOn")
            });
            this.update()
        },
        update: function() {
            this.emit("change", {
                label: this.labels[this.value],
                value: this.value
            })
        }
    })
});
