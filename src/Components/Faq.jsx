import { Accordion, AccordionItem } from "./Accordion";
export default function FaQ() {
 return (
    <Accordion>
      <AccordionItem question="About Our Nursery" defaultOpen>
        <p>
          We are a wholesale native plant nursery in British Columbia specializing in
          locally grown trees, shrubs, and perennials for restoration and landscaping projects.
        </p>
      </AccordionItem>

      <AccordionItem question="Where is Peels Native Plants located?">
        <p>
         
            We’re based in British Columbia, Canada, and serve wholesale customers throughout the
            province, including the Lower Mainland, Vancouver Island, and the BC Interior.
         
        </p>
      </AccordionItem>

      <AccordionItem question="Ordering & Delivery">
        <p>
        Do you deliver outside the Lower Mainland?<br />
          Yes, we deliver throughout BC including Vancouver Island and the Interior.
        </p>
      </AccordionItem>

      <AccordionItem question="How do you ensure plants arrive in good condition?">
        <p>
          
            We take great care in packaging and handling our plants to ensure they arrive in excellent
            condition. This includes using appropriate packaging materials, providing adequate moisture,
            and minimizing transit time.
          
        </p>
      </AccordionItem>

      <AccordionItem question="What payment methods do you accept?">
        <p>
          We accept e-transfer, cheque, or direct deposit payments.
        </p>
      </AccordionItem>

      <AccordionItem question="Do you require a deposit on large orders?">
        <p>
          Yes, we require a 25% deposit on all large orders to secure your reservation.
        </p>
      </AccordionItem>

      <AccordionItem question="Do you grow plants for habitat restoration?">
        <p>
          
            Yes — many of our customers are engaged in ecological restoration, riparian stabilization,
            and reforestation projects.
          
        </p>
      </AccordionItem>

      <AccordionItem question="What is your return or replacement policy?">
        <p>
          
            Returns are not typical for live plants, but we may replace material proven to be damaged
            in transit.
          
        </p>
      </AccordionItem>

      <AccordionItem question="Do you offer wholesale pricing to landscapers or municipalities?">
        <p>
          
            Yes, our pricing is designed for wholesale buyers including landscapers, restoration firms,
            and municipalities.
          
        </p>
      </AccordionItem>
    </Accordion>
  );
}