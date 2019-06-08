// CountdownJS by wzhqwq
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
	function addC(o, name, value) {
		Object.defineProperty(o, name, {
			value: value,
			writable: false,
			configurable: false
		});
	}
	function defer(fn) {
		setTimeout(fn, 0);
	}
	var cds = [];
	var types = [];

	addP($.fn, "cdjs", function () {
		var op = null, cdjsid;
		if (typeof this.cdjsid == "number") {
			op = cds[this.cdjsid];
			cdjsid = this.cdjsid;
		}
		var fn = (type, sec, configuration) => {
			if (types[type] == undefined) return false;
	
			if (op != null) {
				if (op.DOM.parentNode == this) this.removeChild(op.DOM);
				op.destroy();
				delete cds[cdjsid];
			}
			if (this == null) return false;
			op = new Object({seconds: sec});
			var paused = false, frozen = false, finished = false,
				day = Math.floor(sec / 86400),
				hour = Math.floor(sec % 86400 / 3600),
				minite = Math.floor(sec % 3600 / 60),
				second = sec % 60, seconds = sec;
			var listeners = {enterSecond: [], enterMinite: [], enterHour: [], enterDay: [],
				destroy: [], pause: [], resume: [], freeze: [], wakeup: [], finish: [], update: []},
				timeoutId, autopause = 2, lastTime = Date.now(), offset = 0;
			var stubborns = new Object(listeners);
			op.paused = false; op.frozen = false; op.finished = false;
			op.day = day; op.hour = hour; op.minite = minite; op.second = second; op.seconds = seconds;

			function nextSecond() {
				var offset = lastTime + 1000 - Date.now();
				lastTime = Date.now();
				if (offset < -1000) {
					var late = Math.floor(-offset / 1000)
					seconds -= late;
					offset += late * 1000;
					if (late > second && !frozen) {
						op.day = day = Math.floor(seconds / 86400);
						op.hour = hour = Math.floor(seconds % 86400 / 3600);
						op.minite = minite = Math.floor(seconds % 3600 / 60);
						op.second = second = seconds % 60;
					}
				}
				timeoutId = setTimeout(nextSecond, 1000 + offset);

				if (!frozen) for (var i = 0, o = listeners.enterSecond, l = o.length; i < l; i++) defer(o[i]);
				for (var i = 0, o = stubborns.enterSecond, l = o.length; i < l; i++) defer(o[i]);
				op.seconds = --seconds;
				if (seconds <= 0) {
					op.second = second = 0;
					for (var i = 0, o = listeners.finish, l = o.length; i < l; i++) defer(o[i]);
					clearTimeout(timeoutId);
					return;
				}

				second--;
				if (second < 0) {
					second = 59;
					if (!frozen) for (var i = 0, o = listeners.enterMinite, l = o.length; i < l; i++) defer(o[i]);
					for (var i = 0, o = stubborns.enterMinite, l = o.length; i < l; i++) defer(o[i]);
					minite--;
					if (minite < 0) {
						minite = 59;
						if (!frozen) for (var i = 0, o = listeners.enterHour, l = o.length; i < l; i++) defer(o[i]);
						hour--;
						if (hour < 0) {
							hour = 23;
							if (!frozen) for (var i = 0, o = listeners.enterDay, l = o.length; i < l; i++) defer(o[i]);
							for (var i = 0, o = stubborns.enterDay, l = o.length; i < l; i++) defer(o[i]);
							op.day = --day;
						}
						op.hour = hour;
					}
					op.minite = minite;
				}
				op.second = second;
			}
			timeoutId = setTimeout(nextSecond, 1000);

			addC(op, "parentDOM", this); addC(op, "type", type); addC(op, "cfg", configuration);
			addC(op, "pause", function () {
				if (paused) return false;
				clearTimeout(timeoutId);
				offset = Date.now() - lastTime;
				op.paused = paused = true;
				for (var i = 0, o = listeners.pause, l = o.length; i < l; i++) defer(o[i]);
				return true;
			});
			addC(op, "resume", function () {
				if (!paused) return false;
				timeoutId = setTimeout(nextSecond, 1000 - offset);
				op.paused = paused = false;
				for (var i = 0, o = listeners.resume, l = o.length; i < l; i++) defer(o[i]);
				return true;
			});
			addC(op, "freeze", function () {
				if (frozen) return false;
				frozen = true;
				for (var i = 0, o = listeners.freeze, l = o.length; i < l; i++) defer(o[i]);
				return true;
			});
			addC(op, "wakeup", function () {
				if (!frozen) return false;
				frozen = false;
				for (var i = 0, o = listeners.wakeup, l = o.length; i < l; i++) defer(o[i]);
				return true;
			});
			addC(op, "update", function () {});
			addC(op, "destroy", function () {});
			addC(op, "autoPause", function () {});
			addC(op, "addEventListener", function (type, listener, visible) {
				if (typeof type != "string" || type == "" || listener == null) return 0;
				if (!(listeners.hasOwnProperty(type))) return false;
				listeners[type].push(listener);
				return true;
			});
			addC(op, "removeEventListener", function (type, listener) {
				if (typeof type != "string" || type == "" || listener == null) return 0;
				if (!(listeners.hasOwnProperty(type))) return 0;
				var count = 0;
				for (var i = 0, o = listeners[type], l = o.length; i < l; i++)
					if (o[i] === listener) {
						o.splice(i - count, 1);
						count++;
					}
				return count;
			})
			addC(op, "DOM", types[type].call(op));

			cds.push(op);
			addC(this, "cdjsid", cds.length);
			this.appendChild(op.DOM);
			return true;
		};
		if (op != null) fn.prototype = op;
		return fn;
	});
	addC(window, "addCdjsType", function (type, ctor) {
		if (types[type] != undefined) return false;
		types[type] = ctor;
		return true;
	})
})();
// Scoreboard-like Countdown
(function () {
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
	addCdjsType("scoreboard", function () {
		var dom = $(document.createElement("div"));
		dom.addClass("scbd");
		var del = [], hel = [], mel = [], sel = [];
		var day = this.day, hour = this.hour, minite = this.minite, second = this.second;
		if (day != 0) {
			for (var i = 0, str = String(day), len = str.length; i < len; i++)
				del.push(newMeta(str[i])), dom.append(del[i]);
			dom.append("<span>天</span>");
		}
		if (day != 0 || hour != 0) {
			hel.push(newMeta(Math.floor(hour / 10)), newMeta(hour % 10));
			dom.append(hel[0]); dom.append(hel[1]);
			dom.append("<span>时</span>");
		}
		if (day != 0 || hour != 0 || minite != 0) {
			mel.push(newMeta(Math.floor(minite / 10)), newMeta(minite % 10));
			dom.append(mel[0]); dom.append(mel[1]);
			dom.append("<span>分</span>");
		}
		sel.push(newMeta(Math.floor(second / 10)), newMeta(second % 10));
		dom.append(sel[0]); dom.append(sel[1]);
		dom.append("<span>秒</span>");
		
		this.addEventListener("enterSecond", function () {
			sel[0].innerValue = Math.floor(this.second / 10);
			sel[1].innerValue = this.second % 10;
		});
		this.addEventListener("enterMinite", function () {
			mel[0].innerValue = Math.floor(this.minite / 10);
			mel[1].innerValue = this.minite % 10;
		});
		this.addEventListener("enterHour", function () {
			hel[0].innerValue = Math.floor(this.hour / 10);
			hel[1].innerValue = this.hour % 10;
		});
		this.addEventListener("enterDay", function () {
			for (var i = 0, str = String(this.day), len = str.length; i < len; i++)
				del[i].innerValue = str[i];
		});
		this.addEventListener("pause", function () {
			dom.css("opacity", ".5");
		});
		this.addEventListener("resume", function () {
			dom.css("opacity", "");
		});
		this.addEventListener("update", function () {});
	});
})();