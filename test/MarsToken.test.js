
const MarsToken = artifacts.require('MarsToken');

contract('MarsToken', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.mars = await MarsToken.new({ from: minter });
    });


    it('mint', async () => {
        // const num = 0.01 * Math.pow(10, 18);
        // const numAsHex = "0x" + num.toString(16);
        // await this.mars.mint(alice, num)
    })

});
