const { expectRevert, time } = require('@openzeppelin/test-helpers');
const MarsToken = artifacts.require('MarsToken');
const yfMarsBar = artifacts.require('yfMarsBar');
const MasterChef = artifacts.require('MasterChef');
const MockBEP20 = artifacts.require('MockBEP20');
const LotteryRewardPool = artifacts.require('LotteryRewardPool');

contract('MasterChef', ([alice, bob, carol, dev, minter]) => {
    beforeEach(async () => {
        this.mars = await MarsToken.new({ from: minter });
        this.yfmars = await yfMarsBar.new(this.mars.address, { from: minter });
        this.lp1 = await MockBEP20.new('LPToken', 'LP1', '1000000', { from: minter });
        this.lp2 = await MockBEP20.new('LPToken', 'LP2', '1000000', { from: minter });
        this.lp3 = await MockBEP20.new('LPToken', 'LP3', '1000000', { from: minter });
        this.lp4 = await MockBEP20.new('LPToken', 'LP4', '1000000', { from: minter });
        this.chef = await MasterChef.new(this.mars.address, this.yfmars.address, dev, '10', '10', { from: minter });
        await this.mars.transferOwnership(this.chef.address, { from: minter });
        await this.yfmars.transferOwnership(this.chef.address, { from: minter });

        await this.lp1.transfer(bob, '2000', { from: minter });
        await this.lp2.transfer(bob, '2000', { from: minter });
        await this.lp3.transfer(bob, '2000', { from: minter });

        await this.lp1.transfer(alice, '2000', { from: minter });
        await this.lp2.transfer(alice, '2000', { from: minter });
        await this.lp3.transfer(alice, '2000', { from: minter });

    });
    it('real case', async () => {
        this.lottery = await LotteryRewardPool.new(this.chef.address, this.mars.address, dev, carol, { from: minter });
        await this.lp4.transfer(this.lottery.address, '10', { from: minter });

        await this.chef.add('1000', this.lp1.address, true, { from: minter });
        await this.chef.add('1000', this.lp2.address, true, { from: minter });
        await this.chef.add('500', this.lp3.address, true, { from: minter });
        await this.chef.add('500', this.lp4.address, true, { from: minter });

        assert.equal((await this.lp4.balanceOf(this.lottery.address)).toString(), '10');

        await this.lottery.startFarming(4, this.lp4.address, '1', { from: dev });
        await time.advanceBlockTo('40');

        assert.equal((await this.lottery.pendingReward('4')).toString(), '21');
        assert.equal((await this.mars.balanceOf(this.lottery.address)).toString(), '0');

        await this.lottery.harvest(4, { from: dev })
        // console.log(await this.lottery.pendingReward(4).toString())

        assert.equal((await this.mars.balanceOf(this.lottery.address)).toString(), '0');
        assert.equal((await this.mars.balanceOf(carol)).toString(), '22');

    })

});
