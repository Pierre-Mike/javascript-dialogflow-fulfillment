"use strict";

const chai = require("chai");
const spies = require("chai-spies");
const expect = chai.expect;

const intents = require("../intents");
const welcome = require("../intents/welcome");
const reset = require("../intents/reset");

chai.use(spies);

describe("getMapIntents", () => {
	it("should have function for every intent", async () => {
		var intentsName = ["Default Welcome Intent", "reset"];
		var intentsMap = intents();
		// EVERY INTENT HAS TO BE IN THE INTENTMAP
		intentsName.forEach(e => expect(intentsMap.has(e)).to.be.true);
	});
});

describe("intents", () => {
	var spyAdd = chai.spy();

	it("welcome", async () => {
		welcome({ add: spyAdd });
		expect(spyAdd).called.with("hello express");
	});
	it("reset", async () => {
		var spyAdd = chai.spy();
		var spyDel = chai.spy();
		reset({ add: spyAdd, context: { delete: spyDel } });
		expect(spyAdd).called.with("reset successful");
		expect(spyDel).called.with("sharepoint_connection");
	});
});
