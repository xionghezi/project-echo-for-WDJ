import assert from 'node:assert/strict';
import test from 'node:test';
import {lockAxis,shouldAdvance} from '../lib/gestures.ts';
import {isSurveyOwner} from '../lib/admin.ts';
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
test('admin identity fails closed for visitors and non-owners',()=>{
 const owner='owner@example.test';
 assert.equal(isSurveyOwner(new Headers(),owner),false);
 assert.equal(isSurveyOwner(new Headers({'oai-authenticated-user-email':owner}),owner),false);
 assert.equal(isSurveyOwner(new Headers({'oai-authenticated-user-email':'guest@example.test','oai-authenticated-user-id':'guest'}),owner),false);
 assert.equal(isSurveyOwner(new Headers({'oai-authenticated-user-email':owner,'oai-authenticated-user-id':'owner'}),undefined),false);
 assert.equal(isSurveyOwner(new Headers({'oai-authenticated-user-email':'OWNER@example.test','oai-authenticated-user-id':'owner'}),owner),true);
});
