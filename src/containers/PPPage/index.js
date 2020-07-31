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
            <Title level={1}>Privacy Policy </Title>

            <Paragraph>
              The purpose of our privacy policy is to make welcome visitors to Vitae Rain Chat.com
              like yourself aware of the kinds of information we could gather about you. It also
              outlines how that information might be used, if it might be disclosed to third party
              individuals or entities, and the options you have regarding our use of and the
              capacity you have to amend this information, and/or assistance with evaluating our
              email services and solutions.{' '}
            </Paragraph>

            <Paragraph>
              Vitae Rain Chat.com strictly forbids the sending of unsolicited emails in bulk form.
              Vitae Rain Chat has a strong commitment to protecting the privacy rights of Users and
              Subscribers as well as our clients, partners and their subscribers and users. Our aim
              is to give users of our services and products a safe and secure environment in which
              to do so.{' '}
            </Paragraph>

            <Paragraph>
              VitaeRain.Chat Mail gives visitors opportunities to sign up to our website. By
              providing us with your email address you permit us to use the information, and any
              other details you provide at the point of collection, to send marketing communications
              designed to promote Vitae Rain Chat products and services.{' '}
            </Paragraph>

            <Title level={3}>Use Of Information </Title>

            <Paragraph>
              Vitae Rain Chat will keep a record of your details associated with your subscription.
              We also will track your ability to support HTML email, including whether or not you
              open HTML email messages and collect information about the links you click. This is
              done to help us provide you with more of the kind of Content that’s relevant to your
              interests and needs.{' '}
            </Paragraph>

            <Title level={3}>Unsubscribing</Title>

            <Paragraph>
              Should you unsubscribe from our services, we will maintain a record of your
              unsubscription. This is done as required by law, or in case we receive complaints. To
              unsubscribe at any time, please see the unsubscribe option that appears at the bottom
              of every email we send. Clicking this will take you to a page where you can opt-out of
              receiving email messages from us. You can also unsubscribe by sending us an email with
              ‘unsubscribe’ in the subject line and the message section of the email. There is also
              an unsubscribe feature on this website, or you can contact us direct. As soon as we
              have updated our database, your email address will be removed from our marketing email
              lists.{' '}
            </Paragraph>

            <Title level={3}>Use of Personal Identifiable Information (PII) </Title>

            <Paragraph>
              Vitae Rain Chat will be the sole owner of any information about you that we collect.
              We resolve not to license, share, sell, transfer, or rent your email address to any
              third parties, including our sponsors, affiliates, or partners, unless ordered to do
              so by a court of law. Information about you that is submitted to us will only be
              available to people permitted or used by VitaeRain.Chat to manage this kind of
              information, or for the purpose of contacting you in line with consent expressly
              granted by you at the point of email collection, or to send you information in line
              with any request for information you have made.{' '}
            </Paragraph>

            <Title level={3}>Access to information </Title>

            <Paragraph>
              Upon request, and after you have provided us with proof of your identity, we will
              grant you access to all the information we hold about you. After viewing that
              information, you can request any amends be made to that information, or that elements
              of the information we hold are removed and we will carry out your wishes. All such
              requests will be carried out within 10 days of us receiving notification and proof of
              your identity. Vitae Rain Chat will take every possible precaution to protect your
              information.{' '}
            </Paragraph>

            <Paragraph>
              Any sensitive information that is submitted to our website is protected in both online
              and offline forms. Vitae Rain Chat operates and enforces stringent internal policies
              in order to protect the privacy and maintain the security of our visitors. We
              constantly update and re-evaluate our polices, and use new technology as and when
              deemed relevant in order to enhance the security measures we provide.{' '}
            </Paragraph>

            <Title level={3}>YouTube Terms Of Service (Tos) </Title>

            <Paragraph>
              We use YouTube API Services to search YouTube’s library of videos and share them on
              our chat rooms. You can find out more information at YouTube Terms Of Service and
              Google’s Privacy Policy.{' '}
            </Paragraph>

            <Title level={3}>Use Of IP Addresses </Title>

            <Paragraph>
              Vitae Rain Chat will use your IP address to help identify and solve problems that
              might occur with our server and/or websites. We also carry out tracking of browser
              types to build our understanding of visitor needs to influence our website design. No
              IP address is linked to personally identifiable information.{' '}
            </Paragraph>

            <Paragraph>
              We also track IP addresses to monitor user sessions and use the information to see how
              users are interacting with our sites, and help us develop and deliver better services
              to our subscribers and users. All personal information of our users will remain
              anonymous and has no link to IP addresses.{' '}
            </Paragraph>

            <Title level={3}>Use of Cookies </Title>

            <Paragraph>
              Client-side cookies are employed to verify the login status of our subscribers and
              users when they are using services or products that directly link to our website. The
              cookies are also used to track point-of-entry to point-of registration for any user
              taking part in our affiliate sign-up programs. Cookies can also be used to track and
              measure the success or otherwise of specific marketing campaigns.{' '}
            </Paragraph>

            <Paragraph>
              The use of cookies on our site is not linked to any personally identifiable
              information. All cookies are temporary and the cookie terminates when you close your
              browser. You can still use the Vitae Rain Chat site even if you reject cookies, but
              access to the site may be limited.{' '}
            </Paragraph>

            <Paragraph>
              Should Vitae Rain Chat decide or need to alter its Privacy Policy, any changes will be
              listed here. Vitae Rain Chat will not retroactively alter its policies. We maintain a
              strong commitment to keeping all of our users up-to-date with and fully informed about
              the kind of information we’re gathering, how that information could be used, and
              whether such information will be shared with anyone. Users of Vitae Rain Chat sites
              are always notified whenever their information is collected by third parties, enabling
              the user to make an informed decision about whether or not they are happy to proceed
              with services that require a third party.{' '}
            </Paragraph>
          </Typography>
        </Card>
      </div>
    );
  }
}

export default LogIn;
