// test/sample.test.ts
const { assert, expect } = require("chai");
const sinon = require("sinon");

function add(a, b) {
    return a + b;
  }
  
describe('Sample Test Suite', function () {
  it('should add two numbers', function () {
    const result = add(2, 3);
    expect(result).to.equal(5);
  });

  it('should call the spy once', function () {
    const spy = sinon.spy(add);
    spy(1, 2);
    expect(spy.calledOnce).to.be.true;
  });
});
