import { Body, Container, Head, Heading, Hr, Html, Img, Preview, Section, Text } from '@react-email/components'
import {
  btnContainer,
  codeText,
  container,
  h1,
  logo,
  main,
  paragraph,
  validityText,
  verificationSection,
  verifyText,
} from './css'

export interface ForgotPasswordEmailProps {
  code?: string
}

export function ForgotPasswordEmail({ code }: ForgotPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>The acme platform that helps you uncover qualified leads.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            alt="acme"
            height="60"
            src={'https://zpgqhogoevbgpxustvmo.supabase.co/storage/v1/object/public/duck//placeholder%20(copy%201).png'}
            style={{ objectFit: 'contain', ...logo }}
            width="120"
          />

          <Section style={btnContainer}>
            <Heading style={h1}>Reset your acme password</Heading>
            <Text style={paragraph}>
              We received a request to reset the password for your acme account. Please enter the following verification
              code when prompted. If you didn&apos;t request a password reset, you can safely ignore this message.
            </Text>
            <Section style={{ placeContent: 'center', ...verificationSection }}>
              <Text style={verifyText}>Reset code</Text>

              <Text style={codeText}>{code}</Text>
              <Text style={validityText}>(This code is valid for 10 minutes)</Text>
            </Section>
          </Section>
          <Hr />

          <Text style={paragraph}>
            Best,
            <br />
            The acme team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default ForgotPasswordEmail
