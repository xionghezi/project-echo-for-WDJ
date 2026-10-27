import assert from 'node:assert/strict';
import test from 'node:test';
import {lockAxis,shouldAdvance} from '../lib/gestures.ts';
test('small motions are taps; vertical and diagonal movements stay browsing',()=>{
 assert.equal(lockAxis('pending',4,3),'pending');
 assert.equal(lockAxis('pending',6,18),'vertical');
 assert.equal(lockAxis('pending',20,18),'vertical');
 assert.equal(lockAxis('vertical',140,20),'vertical');
 assert.equal(shouldAdvance('vertical',140,20),false);
});
test('right swipe advances only once intent and distance are clear',()=>{
 assert.equal(lockAxis('pending',20,7),'horizontal');
 assert.equal(lockAxis('horizontal',45,38),'horizontal');
 assert.equal(shouldAdvance('horizontal',75,5),false);
 assert.equal(shouldAdvance('horizontal',100,45),true);
 assert.equal(shouldAdvance('horizontal',100,90),false);
 assert.equal(shouldAdvance('horizontal',-100,0),false);
});
