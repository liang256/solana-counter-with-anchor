use anchor_lang::prelude::*;

declare_id!("H3kfUhz6Ygk5oZoxKkDD62oRoyRmmAg8TZb4jyVsWwpK");

#[program]
pub mod set_counter_anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.counter = 0;
        Ok(())
    }

    pub fn decrement(ctx: Context<Update>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.counter = state.counter.checked_sub(1).unwrap_or(0);
        Ok(())
    }

    pub fn increment(ctx: Context<Update>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.counter = state.counter.checked_add(1).unwrap_or(u32::MAX);
        Ok(())
    }

    pub fn set(ctx: Context<Update>, value: u32) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.counter = value;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 4)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)]
    pub state: Account<'info, State>
}

#[account]
pub struct State {
    pub counter: u32
}
