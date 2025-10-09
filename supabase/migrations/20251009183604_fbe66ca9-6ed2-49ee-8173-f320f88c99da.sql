-- Create onboarding_conversations table
CREATE TABLE public.onboarding_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

-- Enable RLS on onboarding_conversations
ALTER TABLE public.onboarding_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_conversations
CREATE POLICY "Users can view their own conversations"
  ON public.onboarding_conversations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON public.onboarding_conversations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON public.onboarding_conversations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all conversations"
  ON public.onboarding_conversations
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create onboarding_messages table
CREATE TABLE public.onboarding_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.onboarding_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on onboarding_messages
ALTER TABLE public.onboarding_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_messages
CREATE POLICY "Users can view messages from their conversations"
  ON public.onboarding_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.onboarding_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their conversations"
  ON public.onboarding_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.onboarding_conversations
      WHERE id = conversation_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all messages"
  ON public.onboarding_messages
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));