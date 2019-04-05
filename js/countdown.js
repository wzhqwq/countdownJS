(function () {
	if (typeof $ == "undefined") {
		console.error("Unable to start CountdownJS: CountdownJS requires jQuery library.");
		return;
	}
	function addP(o, name, getter) {
		Object.defineProperty(o, name, {
			get: getter
		});
	}
	var cds = [];
	var types = [];
	var baseMember = {};
	addP(baseMember, "pause", function () {
		if (this.isPause || this.isFrozen) return;
		this.onPause = true;
		if (this.typeLis[3])
			setTimeout(() => {
				this.typeLis[3].call(this);
			}, 0);
	});
	addP(baseMember, "freeze", function () {
		if (this.isPause || this.isFrozen) return;
		this.onFrozen = true;
		if (this.typeLis[4])
			setTimeout(() => {
				this.typeLis[4].call(this);
			}, 0);
	});
	addP(baseMember, "resume", function () {
		if (this.isPause || this.isFrozen) {
			this.onPause = this.isFrozen = false;
			if (this.typeLis[5])
				setTimeout(() => {
					this.typeLis[5].call(this);
				}, 0);
		}
	});

	addP($.fn, "cdjs", function () {
		return (type, time, configuration) => {
			if (types[type] == undefined) return false;
			var current = (typeof this.cdjsid == "number") ?
				cds[this.cdjsid] : null;
	
			if (current != null) {
				if (current.typeLis[1])
					current.typeLis[1].call(current);
				if (current.DOM.parentNode == this) this.removeChild(current.DOM);
				delete cds[this.cdjsid];
			}
			if (this == null) return false;
			var newCd = {};
			Object.defineProperty(newCd, "DOM", {
				writable: false,
				value: types[type].ctor(time, configuration || {})
			});
		};
	});
	var model = document.createElement("div");
	model.className = "ctdn_meta";
	model.innerHTML = '<div class="ctdn_back"><div><div></div></div><div><div></div></div></div><div class="ctdn_flip"><div><div></div></div><div><div></div></div></div>';
	function newMeta(value) {
		var val_now = value = String(value),
			ret = model.cloneNode(true),
			back_meta = $(ret).children(".ctdn_back").children().children(),
			flip_meta = $(ret).children(".ctdn_flip").children().children();
		Object.defineProperty(ret, "innerValue", {
			set: function (value) {
				value = String(value);
				if (value == val_now) return val_now;
				back_meta[0].innerHTML = flip_meta[1].innerHTML = value;
				var temp = $(ret).children(".ctdn_flip").addClass("flip_start");
				setTimeout(() => {
					flip_meta[0].innerHTML = back_meta[1].innerHTML = value;
					temp.removeClass("flip_start");
				}, 400);
				return val_now = value;
			},
			get: function () {
				return val_now;
			}
		});
		flip_meta[0].innerHTML = back_meta[1].innerHTML = value;
		return ret;
	}
	$.fn.setFlipCountdown = function (remain) {
		if (remain <= 0) return;
		var day = Math.floor(remain / 86400),
			hour = Math.floor(remain % 86400 / 3600),
			minite = Math.floor(remain % 3600 / 60),
			second = remain % 60;
		this.addClass("ctdn");
		var del = [], hel = [], mel = [], sel = [];
		if (day != 0) {
			for (var i = 0, str = String(day), len = str.length; i < len; i++)
				del.push(newMeta(str[i])), this.append(del[i]);
			this.append("<span>天</span>");
		}
		if (day != 0 || hour != 0) {
			hel.push(newMeta(Math.floor(hour / 10)), newMeta(hour % 10));
			this.append(hel[0]); this.append(hel[1]);
			this.append("<span>时</span>");
		}
		if (day != 0 || hour != 0 || minite != 0) {
			mel.push(newMeta(Math.floor(minite / 10)), newMeta(minite % 10));
			this.append(mel[0]); this.append(mel[1]);
			this.append("<span>分</span>");
		}
		sel.push(newMeta(Math.floor(second / 10)), newMeta(second % 10));
		this.append(sel[0]); this.append(sel[1]);
		this.append("<span>秒</span>");

		var interval = setInterval(() => {
			second--;
			if (second < 0) {
				second = 59;
				minite--;
				if (minite < 0) {
					minite = 59;
					hour--;
					if (hour < 0) {
						hour = 23;
						if (day == 0) {
							clearInterval(interval);
							return;
						}
						day--;
						for (var i = 0, str = String(day), len = str.length; i < len; i++)
							del[i].innerValue = str[i];
					}
					hel[0].innerValue = Math.floor(hour / 10);
					hel[1].innerValue = hour % 10;
				}
				mel[0].innerValue = Math.floor(minite / 10);
				mel[1].innerValue = minite % 10;
			}
			sel[0].innerValue = Math.floor(second / 10);
			sel[1].innerValue = second % 10;
		}, 1000);
	};
})();