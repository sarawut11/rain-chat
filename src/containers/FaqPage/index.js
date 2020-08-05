/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import { Row, Col, Card, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;
// import SignInSignUp from '../../components/SignInSignUp';
// import { landingDescription } from '../../constants/login';

class LogIn extends Component {
  render() {
    return (
      <div className="faq-container" style={{ width: '100%' }}>
        <Card style={{ width: '100%' }}>
          <Typography>
            <Title>FAQ</Title>
            <Title level={2}>Chat Rules</Title>

            <Paragraph>
              <ul>
                <li>Users who break the rules will be banned.</li>
                <li>No personal attacks, name calling or making fun of others</li>
                <li>Be creative with your posts. This makes the chat fun, and slower.</li>
              </ul>
            </Paragraph>

            <Title level={2}>How the Chat Works</Title>

            <Paragraph>
              <Title level={3}>Recruiting</Title>
              <ul>
                <li>
                  Copy your invite link from your profile page and use it to invite as many people
                  as you like.
                </li>
                <li>
                  In the future we will offer affiliate banners to go along with your invite link.
                </li>
              </ul>
              <Title level={3}>Send to Rain</Title>
              <ul>
                <li>
                  Go to the Vitae Rain Channel and click the green arrow at the top right. Choose
                  the amount you wish to send and click “Request”.
                </li>
                <li>You will then receive a Vitae address to send tokens and a countdown timer.</li>
              </ul>
              <Title level={3}>Private Message/Group Message</Title>
              <ul>
                <li>To send a message to a user, click their avatar and select private message</li>
                <li>
                  To start a Group Message, click the blue plus (+) icon at the top. Then invite
                  users to the group by selecting the user, open the side bar (click icon in upper
                  right corner), and select invite to chat.
                </li>
              </ul>
              <Title level={3}>Upgrade $14.99</Title>
              <ul>
                <li>
                  Upgraded members receive a portion of all advertising purchases. This includes
                  Static and Rain ads. The distribution is to all Upgraded members for every
                  purchase. The distribution is equal to every pro member. (IF 1,000 upgraded
                  members are on the platform, then the purchase of a rain ad would distribute some
                  of the purchase to all 1,000 upgraded members equally.)
                </li>
              </ul>
              <Title level={3}>Advertising</Title>
              <ul>
                <li>Create and upload your own graphic.</li>
                <li>Select a short headline and a paragraph of text for the ad description.</li>
                <li>
                  Pricing Schedule:
                  <ul>
                    <li>Static Ad: $1.00 per 2000 impressions</li>
                    <li>Rain Ad: $1.00 per 1000 impressions</li>
                    <li>Minimum purchase $25</li>
                  </ul>
                </li>
              </ul>
              <Title level={3}>How to Withdraw</Title>
              <ul>
                <li>
                  Go to your balance and select withdraw. Then provide a valid Vitae address to send
                  your tokens to.
                </li>
              </ul>
              <Title level={3}>How to use Exchanges</Title>
              <ul>
                <li>
                  We suggest using STEX or Instaswap exchanges. STEX requires KYC with a company
                  called Fractal. If you also have a SRW Vitae.co account, you will also use the
                  same Fractal identity with STEX. There are many other exchanges to choose from.
                  Some do not require KYC like InstaSwap and Unnamed.Exchange.
                </li>
                <li>
                  A tutorial video on how to use Instaswap can be found{' '}
                  <a href="https://www.youtube.com/watch?v=OEV3hNb9cQ8">here</a>.
                </li>
                <li>
                  What is KYC?
                  <ul>
                    <li>
                      Know Your Customer (KYC) is the practice carried out by companies to verify
                      the identity of their clients in compliance with legal requirements and
                      current laws and regulations.{' '}
                    </li>
                  </ul>
                </li>
                <li>
                  What is a Blockchain Explorer?
                  <ul>
                    <li>
                      A blockchain explorer is a browser for the blockchain used to track
                      transactions.
                    </li>
                  </ul>
                </li>
              </ul>
              <Title level={3}>Helpdesk</Title>
              <ul>
                <li>
                  Temporarily in the <a href="https://discord.gg/ENGEtWD">Vitae Discord server</a>
                  <ul>
                    <li>Join the #help channel and ask for assistance.</li>
                  </ul>
                </li>
              </ul>
              <Title level={3}>Compensation Plan</Title>
              <ul>
                <li>
                  Why Upgrade? (Free user vs. Pro user)
                  <ul>
                    <li>
                      Free users
                      <ul>
                        <li>must view a Rain Ad before they can post.</li>
                        <li>Can only post the phrase: “I love Vitae” once per hour.</li>
                      </ul>
                    </li>
                    <li>
                      Pro users
                      <ul>
                        <li>Pay a monthly fee of $14.99</li>
                        <li>May post text and emojis</li>
                        <li>All ad purchases share revenue with Pro members.</li>
                        <li>Not required to view a Static ad before posting.</li>
                      </ul>
                    </li>
                  </ul>
                </li>

                <li>
                  There are 7 ways to earn:
                  <ul>
                    <li>
                      Stockpile
                      <ul>
                        <li>
                          Thousands of Vitae tokens are stored for distribution. Every six minutes
                          an amount of Vitae from the stockpile is rained in the rain chat
                        </li>
                      </ul>
                    </li>

                    <li>
                      Donation
                      <ul>
                        <li>
                          When a user sends Vitae tokens to the rain address, those tokens are
                          immediately rained and a portion is distributed to POP rain
                        </li>
                      </ul>
                    </li>

                    <li>Static Ad purchase Rain</li>

                    <li>
                      Upgrade Purchase Rain
                      <ul>
                        <li>When a user upgrades, $5 is immediately rained</li>
                      </ul>
                    </li>

                    <li>
                      Rain Ad View
                      <ul>
                        <li>
                          Rain ads Pay the viewer. This is a paid to view advertisement. All members
                          that view the ad automatically receive a share of the ad revenue
                        </li>
                      </ul>
                    </li>

                    <li>
                      Sponsor Commissions
                      <ul>
                        <li>
                          When a user joins with your invite link, an affiliate commission is earned
                          (See below)
                        </li>
                      </ul>
                    </li>

                    <li>
                      POP Rain
                      <ul>
                        <li>
                          As rains are collected, half of earnings are kept in your invisible POP
                          Rain account.
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>

                <li>
                  Affiliate Commission on downline Upgrade ($5 is divided)
                  <ul>
                    <li>1st Level (infinite) 50%</li>
                    <li>2nd Level (infinite) 25%</li>
                    <li>3rd Level (infinite) 25%</li>
                  </ul>
                </li>

                <li>
                  Operations cost and upkeep ($4.99)
                  <ul>
                    <li>
                      A third of upgrades goes to the site to continue the development and the
                      addition of new features in the future
                    </li>
                  </ul>
                </li>
              </ul>
              <Title level={3}>Marketing</Title>
              <ul>
                <li>Affiliate link provided on your profile page</li>
                <li>Premade Banners of various size to be announced</li>
                <li>Video telling about VitaeRain.Chat</li>
                <li>
                  Suggested Advertising Text
                  <ul>
                    <li>Email format</li>
                    <li>Social format</li>
                  </ul>
                </li>
              </ul>
              <Title level={3}>Future additions</Title>
              <ul>
                <li>Memes, Tipping, etc.</li>
              </ul>
              <Title level={3}>WEBSITES </Title>
              <ul>
                Official Vitae: <a href="https://vitaetoken.io/">https://vitaetoken.io/</a> <br />
                WhitePaper:{' '}
                <a href="https://www.vitaetoken.io/wp-content/uploads/2019/12/VitaeWhitePaper.pdf">
                  https://www.vitaetoken.io/wp-content/uploads/2019/12/VitaeWhitePaper.pdf{' '}
                </a>
                <br />
                Coin Market Cap:{' '}
                <a href="https://coinmarketcap.com/currencies/vitae/">
                  https://coinmarketcap.com/currencies/vitae/
                </a>{' '}
                <br />
                GitHub: <a href="https://github.com/VitaeTeam/">https://github.com/VitaeTeam/</a>
              </ul>
              <Title level={3}>FORUMS </Title>
              <ul>
                Discord: <a href="https://discord.gg/bWNJggg">https://discord.gg/bWNJggg</a> <br />{' '}
                Telegram: <a href="https://t.me/vitaeAG">https://t.me/vitaeAG</a> <br /> Reddit:{' '}
                <a href="https://www.reddit.com/r/VitaeTeam/">
                  https://www.reddit.com/r/VitaeTeam/
                </a>{' '}
                <br />
                BitcoinTalk ANN:
                <a href="https://bitcointalk.org/index.php?topic=5037900.0">
                  https://bitcointalk.org/index.php?topic=5037900.0
                </a>{' '}
                <br />
                Blockfolio:{' '}
                <a href="https://blockfolio.com/coin/VITAE">https://blockfolio.com/coin/VITAE</a>
              </ul>
              <Title level={3}>UTILITY </Title>
              <ul>
                Official Vitae Block-Explorer:{' '}
                <a href="https://explorer.vitae.co/">https://explorer.vitae.co/ </a>
                <br />
                Backup-Explorer2:{' '}
                <a href="https://atomic.vitae.space/">https://atomic.vitae.space/ </a>
                <br />
                Backup-Explorer3:{' '}
                <a href="https://explorer.mnrank.com/explorer/VITAE">
                  https://explorer.mnrank.com/explorer/VITAE{' '}
                </a>
                <br />
                Backup-Explorer4:{' '}
                <a href="https://simpleexplorer.info/coin/vitae">
                  https://simpleexplorer.info/coin/vitae{' '}
                </a>
                <br />
                Node Cluster Status: <a href="https://vitae.space">https://vitae.space </a>
                <br />
                CoinPaprika:{' '}
                <a href="https://coinpaprika.com/coin/vitae-vitae/">
                  https://coinpaprika.com/coin/vitae-vitae/{' '}
                </a>
                <br />
                Nodehub.io:{' '}
                <a href="https://nodehub.io/ref/CryptoParaglider">
                  https://nodehub.io/ref/CryptoParaglider{' '}
                </a>
                <br />
                Vault Shared-Masternodes:{' '}
                <a href="https://my.vault.investments/dashboard/">
                  https://my.vault.investments/dashboard/{' '}
                </a>
                <br />
                Masternodes.Online:{' '}
                <a href="https://masternodes.online/currencies/VITAE/">
                  https://masternodes.online/currencies/VITAE/{' '}
                </a>
                <br />
                Masternode.Live:{' '}
                <a href="https://masternode.live/currencies/VITAE/Vitae">
                  https://masternode.live/currencies/VITAE/Vitae{' '}
                </a>
                <br />
                Masternodes.Pro:{' '}
                <a href="https://masternodes.pro/stats/vitae/statistics">
                  https://masternodes.pro/stats/vitae/statistics{' '}
                </a>
                <br />
                MNrank.com:{' '}
                <a href="https://mnrank.com/coin/VITAE/">https://mnrank.com/coin/VITAE/ </a>
                <br />
                MNcap.com:{' '}
                <a href="https://masternodecap.com/coins/VITAE">
                  https://masternodecap.com/coins/VITAE
                </a>
                <br />
                StakingReturns Calculator:{' '}
                <a href="https://stakingreturns.com/coins/vitae">
                  https://stakingreturns.com/coins/vitae{' '}
                </a>
                <br />
                Vitae Logo Graphics:
                <a href="https://drive.google.com/open?id=1jIYDUJHqfz7qXiquKh2yJj7PZO1eYQOm">
                  https://drive.google.com/open?id=1jIYDUJHqfz7qXiquKh2yJj7PZO1eYQOm{' '}
                </a>
                <br />
                Classic Vitae Logo Graphics:
                <a href="https://drive.google.com/open?id=1wpjZPfqmOkdX4ltOWeXd2BhvKH08970c">
                  https://drive.google.com/open?id=1wpjZPfqmOkdX4ltOWeXd2BhvKH08970c{' '}
                </a>
              </ul>
              <Title level={3}>SOCIAL MEDIA </Title>
              <ul>
                Twitter:{' '}
                <a href="https://twitter.com/OfficialVitae">https://twitter.com/OfficialVitae </a>
                <br />
                Instagram:{' '}
                <a href="https://www.instagram.com/vitae_official/">
                  https://www.instagram.com/vitae_official/{' '}
                </a>
                <br />
                Facebook:{' '}
                <a href="https://www.facebook.com/VitaeToken/">
                  https://www.facebook.com/VitaeToken/{' '}
                </a>
                <br />
                Cheddur:{' '}
                <a href="https://www.cheddur.com/coins/vitae">
                  https://www.cheddur.com/coins/vitae{' '}
                </a>
                <br />
                YouTube Vitae Token:{' '}
                <a href="https://www.youtube.com/channel/UCSB1HGgFCLeocn7TmvT8L8g">
                  https://www.youtube.com/channel/UCSB1HGgFCLeocn7TmvT8L8g
                </a>
                <br />
                YouTube Michael Weber:{' '}
                <a href="https://www.youtube.com/channel/UC3ggiryD-5XLiZ-qGsFINyw">
                  https://www.youtube.com/channel/UC3ggiryD-5XLiZ-qGsFINyw
                </a>
              </ul>
              <Title level={3}>EXCHANGES </Title>
              <ul>
                <i>
                  All users be advised: Do not send funds to exchanges until you have fully
                  completed the KYC process.{' '}
                </i>
              </ul>
              <Title level={3}>KYC required: </Title>
              <ul>
                STEX: <a href="https://bit.ly/38Hj5Pq">https://bit.ly/38Hj5Pq </a>
                <br />
                HitBTC:{' '}
                <a href="https://hitbtc.com/VITAE-to-BTC">https://hitbtc.com/VITAE-to-BTC </a>
                <br />
                Bitladon: <a href="http://bit.ly/donvitae ">http://bit.ly/donvitae </a>
                <br />
                Bitex Live:{' '}
                <a href="https://bitexlive.com/exchange/BTC-VITAE">
                  https://bitexlive.com/exchange/BTC-VITAE
                </a>
                <br />
                WhiteBIT:{' '}
                <a href="https://whitebit.com/referral/62499d21-691e-41f0-9754-78d8f83a5fb6">
                  https://whitebit.com/referral/62499d21-691e-41f0-9754-78d8f83a5fb6{' '}
                </a>
              </ul>
              <Title level={3}>No KYC Required: </Title>
              <ul>
                UnNamed.Exchange:{' '}
                <a href="https://www.unnamed.exchange/Exchange?market=VITAE_BTC">
                  https://www.unnamed.exchange/Exchange?market=VITAE_BTC{' '}
                </a>
                <br />
                Stake Cube: ({`<`}$1,000 USD only):{' '}
                <a href="https://stakecube.net/app/exchange/VITAE_BTC">
                  https://stakecube.net/app/exchange/VITAE_BTC{' '}
                </a>
                <br />
                InstaSwap (KYC for crypto to fiat only):{' '}
                <a href="http://instaswap.io/">http://instaswap.io/ </a>
                <br />
                BitTorro: <a href="https://bittorro.io/">https://bittorro.io/ </a>
                <br />
                Block DX:{' '}
                <a href="https://www.blocknet.co/block-dx/">https://www.blocknet.co/block-dx/ </a>
                <br />
                Social Send: <a href="https://socialsend.net/">https://socialsend.net/ </a>
              </ul>
              <Title level={3}>
                {`"`}Not your keys, not your Crypto. {`"`}
              </Title>
              <ul>
                The safest place to keep your funds is on your own private wallet (Qt-wallet). When
                storing funds on an exchange keep in mind that the keys to the wallets are not your
                own. It is highly recommended that you only move a percentage of your total funds to
                an exchange and for the shortest amount of time possible.{' '}
              </ul>
              <Title level={3}>Need Exchange support?</Title>
              <ul>
                Please use the exchange help ticket system. Be polite and patient. It can take hours
                if not days to receive a reply if they are busy.
              </ul>
              <Title level={3}>
                Qt-Wallet (Users that are new to crypto and computers should use caution){' '}
              </Title>
              <ul>
                <i>
                  Please make sure you are running the most recent version of the desktop wallet.
                  <br />
                  Download:{' '}
                  <a href="https://www.vitaetoken.io/wallet/">https://www.vitaetoken.io/wallet/ </a>
                  <br />
                  Snapshot:{' '}
                  <a href="https://downloads.vitae.co/VitaeSnapshot-latest.zip">
                    https://downloads.vitae.co/VitaeSnapshot-latest.zip{' '}
                  </a>
                  <br />
                  Snapshot2:{' '}
                  <a href="http://gir.sqdmc.net/dev/vitae/">http://gir.sqdmc.net/dev/vitae/ </a>
                  <br />
                  Text for vitae.conf: <br />
                </i>
                # disable zerocoin minting enablezeromint=0 <br />
                # enable staking <br />
                staking=1 <br />
                # add default nodes (DNS)
                <br />
                addnode=tokenseed.vitae.co
                <br />
                addnode=xpcalifornia.vitae.co <br />
                addnode=xplondon.vitae.co
                <br />
                addnode=xpohio.vitae.co
                <br />
                addnode=xporegon.vitae.co
                <br />
                addnode=xpsingapore.vitae.co
                <br />
                addnode=xpstockholm.vitae.co <br />
                addnode=de.vit.tips
                <br />
                addnode=us-w1.vit.tips
                <br />
                addnode=us-w3.vit.tips
                <br />
                addnode=us-w4.vit.tips <br />
                addnode=aus.vit.tips
                <br />
                addnode=jp.vit.tips
                <br />
                addnode=si.vit.tips
                <br />
                addnode=uk.vit.tips <br />
                addnode=ukb.vit.tips
                <br />
                addnode=fr.vit.tips
                <br />
                addnode=de-mc.vit.tips
                <br />
                addnode=sqdmc.net
                <br />
                addnode=us-e2.vit.tips
                <br />
              </ul>
              Thank you and welcome to this exciting project! Vitae is latin for LIFE!
            </Paragraph>
          </Typography>
        </Card>
      </div>
    );
  }
}

export default LogIn;
