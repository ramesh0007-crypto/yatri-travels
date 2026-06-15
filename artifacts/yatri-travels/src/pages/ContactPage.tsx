import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useSubmitContact } from "@workspace/api-client-react";
import { motion } from "framer-motion";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof schema>;

const CONTACT_INFO = [
  { icon: MapPin, label: "Address", value: "Shivraj Municipality Ward No. 06, Kapilvastu, Nepal" },
  { icon: Phone, label: "Phone", value: "+977-9800000000" },
  { icon: Mail, label: "Email", value: "info@yatritravels.com" },
  { icon: Clock, label: "Office Hours", value: "Sun–Fri: 9 AM – 6 PM" },
];

export default function ContactPage() {
  const { toast } = useToast();
  const submitContact = useSubmitContact({
    mutation: {
      onSuccess: () => {
        toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
        form.reset();
      },
      onError: () => toast({ title: "Failed to send message", variant: "destructive" }),
    }
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = (values: FormValues) => {
    submitContact.mutate({ data: values });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="relative py-16 bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1600')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-serif text-4xl font-bold mb-3">Contact Us</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            Have questions about a package? We're here to help plan your perfect pilgrimage.
          </p>
        </div>
      </section>

      <section className="flex-1 py-12 px-4 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h2 className="text-serif text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-4 mb-8">
              {CONTACT_INFO.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <c.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{c.label}</p>
                    <p className="text-sm font-medium">{c.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <a
              href="https://wa.me/9779800000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold text-sm">Chat on WhatsApp</p>
                <p className="text-xs text-white/80">Quick response guaranteed</p>
              </div>
            </a>

            {/* Map Embed */}
            <div className="mt-6 rounded-xl overflow-hidden border border-border shadow-sm h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113937.10068895547!2d83.0237!3d27.5720!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3996e7f1ac2c3f87%3A0xbda0a25a6e38b2c7!2sKapilvastu%2C%20Nepal!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Kapilvastu, Nepal"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-card-border rounded-xl p-6 shadow-sm">
              <h2 className="text-serif text-xl font-bold mb-5">Send Us a Message</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} data-testid="input-contact-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} data-testid="input-contact-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="subject" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="How can we help?" {...field} data-testid="input-contact-subject" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us about your pilgrimage plans..." rows={5} {...field} data-testid="textarea-contact-message" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button type="submit" disabled={submitContact.isPending} className="w-full" size="lg" data-testid="button-send-message">
                    {submitContact.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
