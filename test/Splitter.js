const Splitter = artifacts.require("./Splitter.sol");


web3.eth.expectedExceptionPromise   = require("../utils/expectedExceptionPromise.js");


const { BN, sha3, toWei } = web3.utils;

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract("Splitter", accounts => {
	const [ owner, recipient1, recipient2 ] = accounts;
        let instance;

       beforeEach("Deploy fresh, unpaused Splitter", async function () {
		instance = await Splitter.new({ from: owner });
	});

	it("PreBalances should be zero", async function () {
		const preBalance1 = await instance.balances.call(recipient1);
		const preBalance2 = await instance.balances.call(recipient2);
		assert.equal(preBalance1.toString(), 0, "Failed to deploy with recipient1 account equalling zero");
		assert.equal(preBalance2.toString(), 0, "Failed to deploy with recipient2 account equalling zero");
	});

	it("Should split even deposit correctly", async function () {
		const deposit = 2; // Must be even number
		await instance.splitCoin(recipient1, recipient2, { from: owner, value: deposit });
                const postBalance0 = await instance.balances.call(owner);
		const postBalance1 = await instance.balances.call(recipient1);
		const postBalance2 = await instance.balances.call(recipient2);
 		assert.strictEqual(postBalance1.toString(10), postBalance2.toString(10), "Failed to split even deposit into equal halves");
		assert.strictEqual(postBalance1.toString(10), (deposit / 2).toString(10), "Failed to split deposit into correct amount")
	});

	it("Should split odd deposit correctly", async function () {
		const deposit = 7; 
                await instance.splitCoin(recipient1, recipient2, { from: owner, value: deposit });
                const remainder = deposit %2;// in this case, the remainder should stay in the owner balance
		const postBalance1 = await instance.balances.call(recipient1);
		const postBalance2 = await instance.balances.call(recipient2);
		assert.strictEqual(postBalance1.toString(10), postBalance2.toString(10), "Failed to split odd deposit into equal halves");
		assert.strictEqual(postBalance1.toString(10), ((deposit -remainder) / 2).toString(10), "Failed to split deposit into correct amount")
	});

	it("Should log amount sent, from owner, to recipients, to contract correctly", async function () {
		const deposit = 3;
		const txObject = await instance.splitCoin(recipient1, recipient2, { from: owner, value: deposit });
	        assert.strictEqual(txObject.logs[0].args.amount.toString(10), deposit.toString(10), 
			"Failed to log amount sent to contract correctly");
		assert.strictEqual(txObject.logs[0].args.sender, accounts[0], 
			"Failed to log address sent from correctly");
		assert.strictEqual(txObject.logs[0].args.bob, accounts[1],
		         "Failed to log address sent to correctly");
		assert.strictEqual(txObject.logs[0].args.carol, accounts[2],
			"Failed to log address sent to correctly");
	});

	it("Should withdraw correctly", async function () {
		const deposit = 3; 
		await instance.splitCoin(recipient1, recipient2, { from: owner, value: deposit });
		let postBalance1 = await instance.balances.call(recipient1);
		console.log("Balance before withdrawl: " + postBalance1.toString(10));
		const txObject = await instance.withdrawal({ from: recipient1 });
		postBalance1 = await instance.balances.call(recipient1);
		console.log("Balance after withdrawl: " + postBalance1.toString(10));
		assert.strictEqual(txObject.logs[0].args.amount.toString(10), "1",
			"Failed to log withdrawl correctly");
                assert.strictEqual(txObject.logs[0].args.receiver,recipient1,
			"Failed to send withdrawl to the correct recipient");
	});

         it("Splitter should fail if amount is zero",  async function() {
                 await web3.eth.expectedExceptionPromise(
                      () => { return instance.splitCoin(recipient1, recipient2, { from: owner, value: 0 }); } );
         });

         it("Withdrawal should fail if no funds",  async function() {
                  await web3.eth.expectedExceptionPromise(
                      () => { return instance.withdrawal({ from: recipient2}); });
          });

         it("is OK if pause/resume called by owner", async function() {
                  await instance.contractPaused({ from: owner})
                  .should.be.fulfilled;
                  await instance.resume({ from: owner})
                  .should.be.fulfilled;
                });

         it("should fail if Contract is not paused ", async function() {
                  await web3.eth.expectedExceptionPromise(
                      () => { return instance.resume({ from: owner}); },   );
                });

         it("Withdrawal should fail if in pause",  async function() {
		  const amount = 84;
                  await instance.splitCoin(recipient1, recipient2, { from: owner, value: amount })
                  .should.be.fulfilled;

                  await instance.contractPaused({ from: owner})
                  .should.be.fulfilled;

                  await web3.eth.expectedExceptionPromise(
                      () => { return instance.withdrawal({ from: recipient2}); }, 
                      );
          });
 
         it("Split should fail if amount is zero",  async function() {
                  await web3.eth.expectedExceptionPromise(
                      () => { return instance.splitCoin(recipient1, recipient2, { from: owner, value: 0  }); },);
         });
         it("Split should fail if amount is 1",  async function() {
                  await web3.eth.expectedExceptionPromise(
                      () => { return instance.splitCoin(recipient1, recipient2, { from: owner, value: 1  }); },);
         });

         it("is OK if splitCoin is called after pause/resume",  async function() {
                  await instance.contractPaused({ from: owner})
                  .should.be.fulfilled;
                  await instance.resume({ from: owner})
                  .should.be.fulfilled;
                  await instance.splitCoin(recipient1, recipient2, { from: owner, value: 10  })
                  .should.be.fulfilled;
                });
         it("emit event if paused", async function() {
                  let result = await instance.contractPaused({ from: owner})
                  .should.be.fulfilled;
                  assert.strictEqual(result.logs.length, 1);
                  let logEvent = result.logs[0];

                  assert.strictEqual(logEvent.event, "LogPaused", "LogPaused name is wrong");
                  assert.strictEqual(logEvent.args.pausedBy,owner , "caller is wrong");
                });

        it("Pause should fail if called by any user", async function() {
                  await instance.contractPaused({ from: owner})
                  .should.be.fulfilled;

                  await web3.eth.expectedExceptionPromise(
                      () => { return instance.resume({ from: recipient1 }); }, 
                      );
                });

});
