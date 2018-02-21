define("dojo/Evented dojo/_base/declare dojo/dom-class dojo/dom-style dijit/_WidgetBase dijit/_WidgetsInTemplateMixin dijit/_TemplatedMixin dojo/text!./templates/Card.html".split(" "), function(e, f, c, d, g, h, k, l) {
    return f("Card", [g, k, h, e], {
        declaredClass: "esri.widgets.Card",
        templateString: l,
        colors: ["#eabc02", "#9e9e9e", "#ce692c", "#505050", "#d6d6d6"],
        css: {
            root: "esri-card"
        },
        rank: 0,
        name: "",
        gold: 0,
        silver: 0,
        bronze: 0,
        total: 0,
        flag: "",
        mode: 0,
        selected: !1,
        constructor: function(a) {
            a.RANK && (this.rank = a.RANK);
            a.NAME && (this.name = a.NAME);
            a.GOLD && (this.gold = a.GOLD);
            a.SILVER && (this.silver = a.SILVER);
            a.BRONZE && (this.bronze = a.BRONZE);
            a.TOTAL && (this.total = a.TOTAL);
            a.FLAG && (this.flag = a.FLAG)
        },
        postCreate: function() {
            this.inherited(arguments);
            this._updateCard();
            d.set(this.cardNode, "left", 140 * this.rank + 10 + "px")
        },
        startup: function() {},
        destroy: function() {
            this.inherited(arguments)
        },
        _getCurMedals: function() {
            var a = 0;
            switch (this.mode) {
            case 0:
                a = this.gold;
                break;
            case 1:
                a = this.silver;
                break;
            case 2:
                a = this.bronze;
                break;
            case 3:
                a = this.total
            }
            return a
        },
        update: function(a) {
            this.rank = a.rank;
            this.mode = a.mode;
            this._updateCard()
        },
        _updateCard: function() {
            var a = this._getCurMedals();
            this.numNode.innerHTML = a;
            var b = this.colors[4];
            0 < a && (b = this.colors[this.mode]);
            d.set(this.topNode, "background-color", b);
            d.set(this.cardNode, "left", 140 * this.rank + 10 + "px")
        },
        toggle: function() {
            this.selected ? this.unselect() : this.select();
            var a = {
                rank: this.rank,
                selected: this.selected
            };
            0 === this._getCurMedals() && (a.selected = !1);
            this.emit("center", a)
        },
        select: function() {
            this.selected = !0;
            c.add(this.cardNode, "selected")
        },
        unselect: function() {
            this.selected = !1;
            c.remove(this.cardNode, "selected")
        },
        setMode: function(a) {
            var b = 0;
            switch (a.target.id) {
            case "m1":
                b = 1;
                break;
            case "m2":
                b = 2;
                break;
            case "m3":
                b = 3
            }
            this.emit("change", {
                mode: b
            })
        },
        flip: function() {
            c.toggle(this.cardNode, "flipped")
        }
    })
});
