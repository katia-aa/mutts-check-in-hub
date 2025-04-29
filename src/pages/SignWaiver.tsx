import CheckInLayout from "@/components/CheckInLayout";
import SignaturePad from "@/components/SignaturePad";

const SignWaiver = () => {
  return (
    <CheckInLayout
      step={2}
      title="Let's Sign"
      subtitle="Just a quick paw-thentication"
    >
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm overflow-y-auto max-h-[60vh] text-sm">
        <h1 className="text-xl font-bold mb-4">
          RELEASE OF LIABILITY, WAIVER OF CLAIMS, ASSUMPTION OF RISKS, AND
          INDEMNITY AGREEMENT
        </h1>

        <p className="mb-4">
          By agreeing to the terms of this document, you will waive or give up
          certain legal rights, including the right to sue for negligence or
          claim compensation following an accident or incident.
        </p>

        <p className="mb-4">
          TO: Mutts in the 6ix Ltd. and its directors, employees, vendors,
          representatives, volunteers, independent contractors, partnering
          venues, and assigns (hereinafter collectively referred to as the
          "Releasees"). The current and any future Mutts in the 6ix events are
          herein referred to as "the event."
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          SECTION 1: ACKNOWLEDGEMENT OF RISKS
        </h2>
        <p className="mb-4">
          I hereby waive any and all claims that I have or may have in the
          future against the Releasees and release them from any and all
          liability for any loss, damage, expense, or injury, including claims
          for contribution and indemnity or medical bills to my dog or myself
          arising from my attendance and participation in the event due to any
          cause whatsoever, including negligence and any duty of care owed to me
          by the Releasees.
        </p>

        <p className="mb-4">
          I understand that negligence includes failure on the part of the
          Releasees to take reasonable steps to safeguard or protect me from, or
          to warn me of, the risks, dangers, and hazards referred to below.
        </p>

        <ul className="list-disc ml-6 mb-4">
          <li>
            Pet-related injuries (e.g., bites, scratches), allergies, or other
            incidents
          </li>
          <li>The risk of my dog ingesting harmful objects or substances</li>
          <li>Exposure to diseases or viruses</li>
          <li>Slipping or falling</li>
        </ul>

        <p className="mb-6">
          These risks could result in personal injury to myself, my dog, or
          others. I acknowledge that any pet present may behave unpredictably,
          regardless of the owner's intent or training. I voluntarily assume all
          risks and waive any claims against the Releasees for injuries or
          damages that may occur during my visit, including those resulting from
          the negligence or breach of statutory duty by the Releasees.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          SECTION 2: PERSONAL RESPONSIBILITY
        </h2>
        <p className="mb-4">
          I agree to be solely responsible for my dog during my visit to the
          event. I will ensure my dog adheres to the event's rules and
          guidelines, and I will exercise reasonable caution to prevent harm or
          disturbance to others, their pets, or their property.
        </p>

        <p className="mb-4">
          I freely accept and fully assume all risks, including the possibility
          of personal injury to myself or my dog, as a result of attending the
          event. I acknowledge that I am solely responsible for my dog's
          behavior throughout the entire event.
        </p>

        <p className="mb-4">
          If my dog causes harm or damage, I agree to be responsible for any
          resulting financial consequences.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          SECTION 3: PHOTO/VIDEO RELEASE FOR MARKETING PURPOSES
        </h2>
        <p className="mb-4">
          I hereby grant permission to Mutts in the 6ix and the Releasees to use
          photographs, video footage, and audio recordings of me and/or my dog
          taken during the event for marketing, promotional, and other business
          purposes. These materials may be used in, but are not limited to,
          social media posts, website content, advertisements, and print
          materials.
        </p>

        <ul className="list-disc ml-6 mb-4">
          <li>
            I will not receive any compensation, monetary or otherwise, for the
            use of these images or recordings.
          </li>
          <li>I waive any right to inspect or approve the final product.</li>
          <li>
            I release the Releasees from any claims or liabilities that may
            arise in connection with the use of these photographs, video, or
            audio materials, including any claims of defamation, invasion of
            privacy, or infringement of publicity rights.
          </li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          SECTION 4: RELEASE OF LIABILITY, WAIVER OF CLAIMS, AND INDEMNITY
          AGREEMENT
        </h2>
        <p className="mb-4">
          I understand that I am solely responsible for my pet's behavior and
          any damage, injuries, or harm that my pet may cause to others, their
          pets, or their property.
        </p>

        <p className="mb-4">
          <strong>Release and Indemnification:</strong> In consideration for
          being allowed to attend the event, I agree to release, indemnify, and
          hold harmless the Releasees from any and all liability, including
          claims for contribution or indemnity, for any harm to my dog or
          personal injury to myself or my dog.
        </p>

        <p className="mb-4">
          <strong>Personal Belongings:</strong> I understand the Releasees are
          not liable for any loss, theft, or damage to my personal belongings,
          or any other items I bring to the event.
        </p>

        <p className="mb-4">
          <strong>Agreement to Follow Rules:</strong> I agree to abide by all
          rules, guidelines, and instructions given by Mutts in the 6ix or its
          employees during the event. I understand that failure to comply with
          these rules may result in removal from the event without a refund or
          having my dog leashed.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-3">
          SECTION 5: LEGAL AGREEMENTS
        </h2>
        <p className="mb-4">
          <strong>GIVING UP CERTAIN RIGHTS:</strong> I understand that by
          signing this Release Agreement, I am waiving certain legal rights,
          including the right to sue, that may arise from or result from
          participating in the event's activities. This includes claims
          resulting from the negligence of the Releasees.
        </p>

        <p className="mb-4">
          <strong>INDEMNIFICATION:</strong> I agree to indemnify and hold
          harmless the Releasees from any liability or claims, including for
          contribution and indemnity, arising from my participation in the event
          or harm to my dog.
        </p>

        <p className="mb-4">
          <strong>BINDING AGREEMENT:</strong> This Release Agreement shall be
          effective and binding upon me, my heirs, executors, and assigns.
        </p>

        <p className="mb-4">
          <strong>JURISDICTION:</strong> This Release Agreement and any rights,
          duties, and obligations as between the parties shall be governed and
          interpreted solely in accordance with the laws of Ontario, Canada.
        </p>

        <p className="mb-4">
          <strong>SEVERABILITY:</strong> If any provision of this Agreement is
          deemed invalid, illegal, or unenforceable by a court of competent
          jurisdiction, the remaining provisions will remain valid and
          enforceable.
        </p>

        <p className="mb-6">
          By signing this Agreement, I acknowledge that I have not relied on any
          oral or written representations or statements made by the Releasees
          regarding the safety of the event other than those set forth in this
          Agreement.
        </p>
      </div>
      <div className="text-center mb-4">
        <p className="text-lg font-medium">
          Please sign below to join the fun{" "}
          <span role="img" aria-label="hand pointing down">
            👇
          </span>
        </p>
      </div>
      <SignaturePad />
    </CheckInLayout>
  );
};

export default SignWaiver;
